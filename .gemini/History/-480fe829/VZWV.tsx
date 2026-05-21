/**
 * IDENTITY: JSON-LD (Semantic Antevisão)
 * ROLE: Injeta metadados estruturados para SEO e agentes de IA.
 *       Transforma texto em ontologia formal.
 */
export default function JsonLd ( { data }: Readonly<{ data: any }> ) {
    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={ { __html: JSON.stringify( data ) } }
        />
    );
}
