from PIL import Image
import os

input_folder = "."
output_folder = "./webp"
os.makedirs(output_folder, exist_ok=True)

extensoes = (".jpg", ".jpeg", ".JPG", ".JPEG")

for nome_arquivo in os.listdir(input_folder):
    if nome_arquivo.endswith(extensoes):
        caminho_original = os.path.join(input_folder, nome_arquivo)
        nome_base = os.path.splitext(nome_arquivo)[0]
        caminho_saida = os.path.join(output_folder, nome_base + ".webp")

        try:
            with Image.open(caminho_original) as img:
                img.save(caminho_saida, "webp", quality=85)
                print(f"{nome_arquivo} → {nome_base}.webp")
        except Exception as e:
            print(f"Erro com {nome_arquivo}: {e}")
