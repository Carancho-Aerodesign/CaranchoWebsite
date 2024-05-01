import { defineConfig } from 'sanity';
import { deskTool } from 'sanity/desk';

const config = defineConfig({
    projectId: 'c24ncoul',
    dataset: 'production',
    title: 'Carancho', 
    apiVersion: '2024-04-15',
    basePath: '/studio',
    plugins: [deskTool()],
})

export default config;