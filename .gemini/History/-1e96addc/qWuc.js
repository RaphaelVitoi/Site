/**
 * IDENTITY: Purificador de Entropia OneDrive
 * PATH: scripts/utils/purge_onedrive_copies.js
 * ROLE: Varrer a árvore e aniquilar cópias corrompidas geradas pela dessincronização da nuvem.
 */

const fs = require( 'node:fs' );
const path = require( 'node:path' );

const targetDir = path.resolve( __dirname, '../../frontend' );

// Expressão SOTA: Captura "- copy", "- Copy", "(1)", "(2)", etc., antes da extensão.
const entropyPattern = /(?: - [Cc]opy|\(\d+\))(?:\.[a-zA-Z0-9]+)?$/;

let deletedCount = 0;

function obliterateEntropy( dir ) {
    const files = fs.readdirSync( dir );

    for ( const file of files ) {
        const fullPath = path.join( dir, file );
        const stat = fs.statSync( fullPath );

        if ( stat.isDirectory() && file !== 'node_modules' && file !== '.next' ) {
            obliterateEntropy( fullPath );
        } else if ( stat.isFile() ) {
            const ext = path.extname( file );
            const nameWithoutExt = path.basename( file, ext );

            if ( entropyPattern.test( nameWithoutExt ) ) {
                fs.unlinkSync( fullPath );
                console.log( `[VAPORIZADO] ${fullPath}` );
                deletedCount++;
            }
        }
    }
}

console.log( '\n[SOTA] Iniciando varredura termodinâmica no frontend...' );
obliterateEntropy( targetDir );
console.log( `\n[SOTA] Homeostase restaurada. ${deletedCount} arquivos obsoletos aniquilados.\n` );
