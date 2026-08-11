// Guardar como: tools/optimizar.mjs  (en el repo wauro-assets)
// Uso: node tools/optimizar.mjs <entrada.glb> <salida.glb>
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dedup, prune, draco, textureCompress } from '@gltf-transform/functions';
import draco3d from 'draco3dgltf';
import sharp from 'sharp';
import { statSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const [entrada, salida] = process.argv.slice(2);
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
  'draco3d.encoder': await draco3d.createEncoderModule(),
  'draco3d.decoder': await draco3d.createDecoderModule(),
});
const mb = b => (b / 1048576).toFixed(1) + ' MB';
const doc = await io.read(entrada);
await doc.transform(
  dedup(), prune(),
  textureCompress({ encoder: sharp, targetFormat: 'webp', resize: [2048, 2048] }),
  draco(),
);
mkdirSync(dirname(salida), { recursive: true });
await io.write(salida, doc);
console.log(`✓ ${entrada} ${mb(statSync(entrada).size)} → ${salida} ${mb(statSync(salida).size)}`);
if (statSync(salida).size > 20 * 1048576)
  console.warn('⚠ El optimizado supera 20 MB — jsDelivr no lo servirá; revisar texturas.');
