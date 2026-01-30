"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function UserCards() {
  const [app_users, setapp_users] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchapp_users = async () => {
      const { data, error } = await supabase
        .from("app_users")
        .select("id, name, age, email, role, village, created_at")
        .order("created_at", { ascending: false });

        console.log(data);
        

      if (error) {
        console.error(error);
        setError("Failed to fetch app_users");
      } else {
        setapp_users(data);
      }

      setLoading(false);
    };

    fetchapp_users();
  }, []);

  if (loading) {
    return <p className="text-sm text-gray-500">Loading app_users...</p>;
  }

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  return (
    <div className="bg-white border rounded overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b">
          <tr>
            <Th>Name</Th>
            <Th>Age</Th>
            <Th>Email</Th>
            <Th>Role</Th>
            <Th>Place</Th>
            <Th>Joined</Th>
          </tr>
        </thead>

        <tbody>
          {app_users.map((user) => (
            <tr
              key={user.id}
              className="border-b last:border-0 hover:bg-gray-50"
            >
              <Td>{user.name || "—"}</Td>
              <Td>{user.age || "—"}</Td>

              <Td>{user.email || "—"}</Td>
              <Td>
                <RoleBadge role={user.role} />
              </Td>
              <Td>{user.village || "—"}</Td>
              <Td>
                {new Date(user.created_at).toLocaleDateString()}
              </Td>
            </tr>
          ))}
        </tbody>
      </table>

      {app_users.length === 0 && (
        <p className="text-center text-sm text-gray-500 py-4">
          No app_users found
        </p>
      )}
    </div>
  );
}

/* ---------------- UI HELPERS ---------------- */

function Th({ children }) {
  return (
    <th className="px-4 py-2 text-left font-medium text-gray-600">
      {children}
    </th>
  );
}

function Td({ children }) {
  return <td className="px-4 py-2">{children}</td>;
}

function RoleBadge({ role }) {
  const styles = {
    admin: "bg-red-100 text-red-700",
    doctor: "bg-blue-100 text-blue-700",
    helper: "bg-yellow-100 text-yellow-700",
    patient: "bg-green-100 text-green-700",
  };

  return (
    <span
      className={`px-2 py-1 rounded text-xs font-medium ${
        styles[role] || "bg-gray-100 text-gray-600"
      }`}
    >
      {role}
    </span>
  );
}
