export default function JsonLd( { data }: Readonly<{ data: any }> ) {
    return <script type="application/ld+json" dangerouslySetInnerHTML={ { __html: JSON.stringify( data ) } } />;
}
