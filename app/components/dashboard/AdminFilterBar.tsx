type AdminFilterBarProps = {
    departmentOptions: string[];
    roleOptions: string[];
    locationOptions: string[];
    selectedDepartment: string;
    selectedRole: string;
    selectedLocation: string;
    onDepartmentChange: (department: string) => void;
    onRoleChange: (role: string) => void;
    onLocationChange: (location: string) => void;
};

export function AdminFilterBar({
                                   departmentOptions,
                                   roleOptions,
                                   locationOptions,
                                   selectedDepartment,
                                   selectedRole,
                                   selectedLocation,
                                   onDepartmentChange,
                                   onRoleChange,
                                   onLocationChange,
                               }: AdminFilterBarProps) {
    return (
        <section className="border border-zinc-300 bg-white p-5 shadow-sm">
            <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                <div>
                    <p className="text-xs font-black uppercase tracking-[0.22em] text-red-800">
                        Role-Based Filtering
                    </p>
                    <h2 className="mt-2 text-2xl font-black uppercase tracking-tight text-zinc-950">
                        Training Administrator Scope
                    </h2>
                    <p className="mt-2 text-sm font-medium text-zinc-600">
                        Filter training dashboard data by department, role, and location.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                    <label className="mb-1 block text-xs font-black uppercase tracking-[0.18em] text-zinc-600">
                        Department
                    </label>
                    <select
                        value={selectedDepartment}
                        onChange={(event) => onDepartmentChange(event.target.value)}
                        className="w-full border border-zinc-400 bg-white px-4 py-3 text-sm font-bold text-zinc-900 outline-none focus:border-red-800"
                    >
                        {departmentOptions.map((department) => (
                            <option key={department} value={department}>
                                {department}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="mb-1 block text-xs font-black uppercase tracking-[0.18em] text-zinc-600">
                        Role
                    </label>
                    <select
                        value={selectedRole}
                        onChange={(event) => onRoleChange(event.target.value)}
                        className="w-full border border-zinc-400 bg-white px-4 py-3 text-sm font-bold text-zinc-900 outline-none focus:border-red-800"
                    >
                        {roleOptions.map((role) => (
                            <option key={role} value={role}>
                                {role}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="mb-1 block text-xs font-black uppercase tracking-[0.18em] text-zinc-600">
                        Location
                    </label>
                    <select
                        value={selectedLocation}
                        onChange={(event) => onLocationChange(event.target.value)}
                        className="w-full border border-zinc-400 bg-white px-4 py-3 text-sm font-bold text-zinc-900 outline-none focus:border-red-800"
                    >
                        {locationOptions.map((location) => (
                            <option key={location} value={location}>
                                {location}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </section>
    );
}