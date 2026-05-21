import { DownwardDriftSimulator } from "@/components/DownwardDriftSimulator";

export default function IcmToolsPage ()
{
    return (
        <main className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-950 text-white">
            <div className="container mx-auto">
                <h1 className="mb-8 text-4xl font-bold text-center text-white">
                    Laboratório de ICM Universal (V2)
                </h1>
                <DownwardDriftSimulator />
            </div>
        </main>
    );
}
