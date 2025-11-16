import * as admin from "firebase-admin";
import Busboy from "busboy";
import cors from "cors";
import express, {NextFunction, Request, Response} from "express";
import {setGlobalOptions} from "firebase-functions";
import {onRequest} from "firebase-functions/https";
import * as logger from "firebase-functions/logger";
import sharp, {FitEnum} from "sharp";
import {v4 as uuidv4} from "uuid";

admin.initializeApp();

declare module "express-serve-static-core" {
  interface Request {
    user?: admin.auth.DecodedIdToken;
  }
}

setGlobalOptions({maxInstances: 10});

const app = express();
app.use(cors({origin: true}));
app.use((req, res, next) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.set("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }
  next();
});

const bucket = admin.storage().bucket();
const firebaseConfig = process.env.FIREBASE_CONFIG ?
  JSON.parse(process.env.FIREBASE_CONFIG) : {};
const PROJECT_ID =
  firebaseConfig.projectId ||
  process.env.GCLOUD_PROJECT ||
  "default-app";
const MAX_FILE_SIZE_MB = 15;

type UploadTarget = "member" | "project" | "sponsor";

interface UploadedFile {
  buffer: Buffer;
  fileName: string;
  mimeType: string;
}

interface UploadPreset {
  folder: string;
  width: number;
  height: number;
  fit: keyof FitEnum;
  background?: string;
  quality?: number;
}

const UPLOAD_PRESETS: Record<UploadTarget, UploadPreset> = {
  member: {
    folder: `public/${PROJECT_ID}/memberImages`,
    width: 600,
    height: 600,
    fit: "cover",
    quality: 85,
  },
  project: {
    folder: `public/${PROJECT_ID}/projectImages`,
    width: 1600,
    height: 900,
    fit: "cover",
    quality: 82,
  },
  sponsor: {
    folder: `public/${PROJECT_ID}/sponsorLogos`,
    width: 800,
    height: 600,
    fit: "contain",
    background: "#ffffff",
    quality: 80,
  },
};

const authenticateRequest = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      res.status(401).json({error: "Token de autenticação ausente."});
      return;
    }
    const token = authHeader.replace("Bearer ", "");
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    logger.error("Erro na autenticação da requisição", error);
    res.status(401).json({error: "Token inválido ou expirado."});
  }
};

const parseFileFromRequest = (req: Request): Promise<UploadedFile> => {
  return new Promise((resolve, reject) => {
    const busboy = Busboy({
      headers: req.headers,
      limits: {
        fileSize: MAX_FILE_SIZE_MB * 1024 * 1024,
        files: 1,
      },
    });

    let uploadBuffer: Buffer | null = null;
    let fileName = "";
    let mimeType = "";
    let fileFound = false;

    busboy.on("file", (_fieldname, file, info) => {
      fileFound = true;
      fileName = info.filename || "upload";
      mimeType = info.mimeType || "application/octet-stream";
      const chunks: Buffer[] = [];

      file.on("data", (data) => chunks.push(data));
      file.on("limit", () => reject(new Error("FILE_TOO_LARGE")));
      file.on("end", () => {
        uploadBuffer = Buffer.concat(chunks);
      });
    });

    busboy.on("error", (error) => reject(error));
    busboy.on("finish", () => {
      if (!fileFound || !uploadBuffer) {
        reject(new Error("NO_FILE"));
        return;
      }
      resolve({
        buffer: uploadBuffer,
        fileName,
        mimeType,
      });
    });

    const rawBody = (req as Request & {rawBody?: Buffer}).rawBody;
    if (rawBody) {
      busboy.end(rawBody);
    } else {
      req.pipe(busboy);
    }
  });
};

const slugify = (value: string) =>
  value.toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "upload";

const isWebpMimeType = (mimeType?: string) =>
  typeof mimeType === "string" && mimeType.toLowerCase().includes("webp");

const processImage = async (
  buffer: Buffer,
  target: UploadTarget,
  mimeType?: string,
): Promise<{processed: Buffer; contentType: string; extension: string}> => {
  const preset = UPLOAD_PRESETS[target];
  const originalInstance = sharp(buffer);
  const metadata = await originalInstance.metadata();
  const alreadyWebp = metadata.format === "webp" || isWebpMimeType(mimeType);
  const pipeline = originalInstance.clone().rotate().resize(preset.width, preset.height, {
    fit: preset.fit,
    background: preset.background ?? "#ffffff",
  });

  const processed = alreadyWebp
    ? await pipeline.toBuffer()
    : await pipeline.webp({
      quality: preset.quality ?? 85,
    }).toBuffer();

  return {
    processed,
    contentType: "image/webp",
    extension: "webp",
  };
};

const saveToStorage = async (
  data: Buffer,
  contentType: string,
  destinationPath: string,
) => {
  const file = bucket.file(destinationPath);
  const downloadToken = uuidv4();
  await file.save(data, {
    metadata: {
      contentType,
      cacheControl: "public,max-age=31536000,immutable",
      metadata: {
        firebaseStorageDownloadTokens: downloadToken,
      },
    },
  });

  const encodedPath = encodeURIComponent(destinationPath);
  const url =
    `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodedPath}?alt=media&token=${downloadToken}`;

  return {url, token: downloadToken};
};

const buildDestinationPath = (target: UploadTarget, fileName: string, ext: string) => {
  const preset = UPLOAD_PRESETS[target];
  const safeFileName = slugify(fileName);
  return `${preset.folder}/${Date.now()}_${safeFileName}.${ext}`;
};

const handleUpload = async (req: Request, res: Response) => {
  const targetParam = req.params.target as UploadTarget;
  if (!["member", "project", "sponsor"].includes(targetParam)) {
    res.status(400).json({error: "Tipo de upload inválido."});
    return;
  }

  try {
    const uploadedFile = await parseFileFromRequest(req);
    if (!uploadedFile.mimeType?.startsWith("image/")) {
      res.status(400).json({error: "Apenas ficheiros de imagem são suportados."});
      return;
    }
    const {processed, contentType, extension} =
      await processImage(uploadedFile.buffer, targetParam, uploadedFile.mimeType);
    const destination = buildDestinationPath(
      targetParam,
      uploadedFile.fileName,
      extension,
    );
    const {url} = await saveToStorage(processed, contentType, destination);

    res.status(201).json({
      url,
      path: destination,
      contentType,
    });
  } catch (error) {
    if ((error as Error).message === "NO_FILE") {
      res.status(400).json({error: "Nenhum ficheiro foi enviado."});
      return;
    }
    if ((error as Error).message === "FILE_TOO_LARGE") {
      res.status(413).json({
        error: `O ficheiro excede o limite de ${MAX_FILE_SIZE_MB}MB.`,
      });
      return;
    }
    logger.error("Erro no upload de imagem", error);
    res.status(500).json({error: "Erro ao processar imagem."});
  }
};

app.post("/upload/:target", authenticateRequest, handleUpload);

export const api = onRequest({maxInstances: 10}, app);
