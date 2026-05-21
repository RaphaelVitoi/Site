const fs = require( 'node:fs' );

function replaceInFiles ( dir )
{
  const files = fs.readdirSync( dir, { withFileTypes: true } );
  for ( const file of files )
  {
    const res = dir + '/' + file.name;
    if ( file.isDirectory() )
    {
      replaceInFiles( res );
    } else if ( res.endsWith( '.tsx' ) )
    {
      let content = fs.readFileSync( res, 'utf8' );

      const newContent = content.replaceAll( /<Link([^>]*?)href=["']\/(simulador|laboratorio-v2)["']/g, ( match, p1, p2 ) =>
      {
        if ( !p1.includes( 'prefetch' ) )
        {
          return `<Link prefetch={false}${ p1 }href="/${ p2 }"`;
        }
        return match;
      } );

      if ( content !== newContent )
      {
        fs.writeFileSync( res, newContent );
        console.log( 'Updated:', res );
      }
    }
  }
}

replaceInFiles( 'C:/Users/Raphael/.gemini/Site/frontend/src' );
