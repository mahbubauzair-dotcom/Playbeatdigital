import React, { useState } from 'react';
import { AdminAuthGate } from './AdminAuthGate';
import { AdminDashboard } from './AdminDashboard';

export const AdminPage: React.FC = () => {
  const [, setRefresh] = useState(0);

  return (
    <AdminAuthGate>
      {(admin) => (
        <AdminDashboard
          admin={admin}
          onSignOut={() => setRefresh((prev) => prev + 1)}
        />
      )}
    </AdminAuthGate>
  );
};
