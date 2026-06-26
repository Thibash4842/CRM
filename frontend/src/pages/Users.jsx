import { useEffect, useState } from 'react';
import { Users, Shield } from 'lucide-react';
import { usersApi } from '../services/api';
import PageHeader, { LoadingSpinner } from '../components/ui/PageHeader';
import Badge from '../components/ui/Badge';
import Card from '../components/ui/Card';
import { ROLES } from '../utils/constants';

const roleColors = { ADMIN: 'bg-red-500', MANAGER: 'bg-purple-500', SALES_EXECUTIVE: 'bg-blue-500' };

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    usersApi.getAll().then(setUsers).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <PageHeader title="User Management" subtitle="Manage team members and roles" />

      {loading ? <LoadingSpinner /> : (
        <div className="grid gap-4">
          {users.map((user) => {
            const role = ROLES.find((r) => r.value === user.role);
            return (
              <Card key={user.id} hover className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center text-white font-semibold">
                    {user.firstName[0]}{user.lastName[0]}
                  </div>
                  <div>
                    <h3 className="font-semibold">{user.firstName} {user.lastName}</h3>
                    <p className="text-sm text-slate-500">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge color={roleColors[user.role] || 'bg-slate-500'}>
                    <Shield className="w-3 h-3 mr-1 inline" />
                    {role?.label || user.role}
                  </Badge>
                  <span className={`text-xs px-2 py-1 rounded-full ${user.isActive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700'}`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
