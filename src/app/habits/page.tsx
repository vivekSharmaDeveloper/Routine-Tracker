"use client";

// app/habits/page.tsx
import HabitList from "@/src/components/HabitList";
import HabitsHeader from "@/src/components/HabitsHeader";

export default function HabitsPage() {
  // Mock user data - replace with actual user data from your auth system
  const mockUser = {
    name: "John Doe",
    email: "john.doe@example.com",
    // image: "/path/to/avatar.jpg" // Optional
  };

  return (
    <>
      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6 relative">
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05] pointer-events-none" style={{backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3Ccircle cx='53' cy='53' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`}} />
        
        <HabitsHeader user={mockUser} />

        <div className="relative z-10">
          <HabitList />
        </div>
        {/* <div className="max-w-4xl mx-auto">
          <HomeClient />
        </div> */}
      </main>
    </>
  );
}
