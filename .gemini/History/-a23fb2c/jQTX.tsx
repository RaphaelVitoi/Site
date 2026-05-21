import ICMCalculator from "@/components/ICMCalculator";

export const metadata = {
    title: 'Calculadora ICM | Ferramentas',
    description: 'Simule cenários de mesa final e calcule sua equity com o Independent Chip Model (ICM).',
};

export default function ICMToolPage() {
    return (
        <main className="flex flex-col items-center justify-center py-12 px-4">
            <ICMCalculator />
        </main>
    );
}