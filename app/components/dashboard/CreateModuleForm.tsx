type CreateModuleFormProps = {
    onCreateModule: (event: React.FormEvent<HTMLFormElement>) => void;
    isCreating: boolean;
};

export function CreateModuleForm({
                                     onCreateModule,
                                     isCreating,
                                 }: CreateModuleFormProps) {
    return (
        <form
            onSubmit={onCreateModule}
            className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm"
        >
            <h2 className="text-xl font-semibold mb-4">Create Module</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                    name="title"
                    placeholder="Module title"
                    className="w-full p-2 border border-slate-300 rounded disabled:bg-slate-100"
                    disabled={isCreating}
                    required
                />

                <input
                    name="category"
                    placeholder="Category"
                    className="w-full p-2 border border-slate-300 rounded disabled:bg-slate-100"
                    disabled={isCreating}
                    required
                />

                <input
                    name="description"
                    placeholder="Description"
                    className="w-full p-2 border border-slate-300 rounded md:col-span-2 disabled:bg-slate-100"
                    disabled={isCreating}
                    required
                />

                <input
                    name="estimated_minutes"
                    type="number"
                    min="1"
                    placeholder="Estimated minutes"
                    className="w-full p-2 border border-slate-300 rounded disabled:bg-slate-100"
                    disabled={isCreating}
                    required
                />
            </div>

            <button
                type="submit"
                disabled={isCreating}
                className="mt-4 bg-green-600 text-white px-4 py-2 rounded disabled:bg-green-300 disabled:cursor-not-allowed"
            >
                {isCreating ? "Creating..." : "Create Module"}
            </button>
        </form>
    );
}