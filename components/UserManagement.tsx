import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { useUserStore } from '../store/useUserStore';

export const UserManagement: React.FC = () => {
  const { users, currentUser, addUser, updateUser, deleteUser } = useUserStore();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editingUser, setEditingUser] = useState<Partial<User>>({
    role: 'travel_designer', 
    avatarUrl: ''
  });

  const getRoleDisplayName = (role: UserRole) => {
    switch(role) {
      case 'administrator': return 'Administrateur';
      case 'travel_designer': return 'Concepteur de voyage';
      case 'sales_agent': return 'Commercial';
      case 'viewer': return 'Consultation seulement';
      default: return role;
    }
  };

  const handleEditClick = (user: User) => {
    setEditingUser({ ...user, password: '' });
    setIsEditing(true);
  };

  const handleCreateClick = () => {
    setEditingUser({ role: 'travel_designer', avatarUrl: '', fullName: '', username: '', password: '' });
    setIsEditing(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser.id) {
        updateUser(editingUser as User);
    } else {
        if (!editingUser.username || !editingUser.password || !editingUser.fullName) return;
        addUser(editingUser as Omit<User, 'id'>);
    }
    setIsEditing(false);
    setEditingUser({});
  };

  if (isEditing) {
    return (
        <div className="flex flex-1 justify-center py-8 px-4 sm:px-8 animate-fadeIn">
            <div className="flex flex-col max-w-[600px] w-full gap-8 bg-white dark:bg-slate-800 p-8 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                        {editingUser.id ? 'Modifier Utilisateur' : 'Nouvel Utilisateur'}
                    </h2>
                    <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-slate-600">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    {/* ... Same inputs as before ... */}
                    <label className="flex flex-col gap-2">
                        <span className="text-sm font-bold text-slate-700">Nom Complet</span>
                        <input 
                            required
                            type="text" 
                            className="form-input rounded-lg border-slate-300 py-2.5 px-3 text-sm focus:outline-none"
                            placeholder="ex: Sarah Connor"
                            value={editingUser.fullName || ''}
                            onChange={e => setEditingUser({...editingUser, fullName: e.target.value})}
                        />
                    </label>

                    <label className="flex flex-col gap-2">
                        <span className="text-sm font-bold text-slate-700">Nom d'utilisateur</span>
                        <input 
                            required
                            type="text" 
                            className="form-input rounded-lg border-slate-300 py-2.5 px-3 text-sm focus:outline-none"
                            placeholder="ex: sarah.c"
                            value={editingUser.username || ''}
                            onChange={e => setEditingUser({...editingUser, username: e.target.value})}
                        />
                    </label>
                    
                    <label className="flex flex-col gap-2">
                        <span className="text-sm font-bold text-slate-700">
                            {editingUser.id ? 'Nouveau mot de passe (laisser vide pour ne pas changer)' : 'Mot de passe'}
                        </span>
                        <input 
                            required={!editingUser.id}
                            type="password" 
                            className="form-input rounded-lg border-slate-300 py-2.5 px-3 text-sm focus:outline-none"
                            placeholder="••••••••"
                            value={editingUser.password || ''}
                            onChange={e => setEditingUser({...editingUser, password: e.target.value})}
                        />
                    </label>

                    <div className="grid grid-cols-2 gap-4">
                        <label className="flex flex-col gap-2">
                            <span className="text-sm font-bold text-slate-700">Rôle</span>
                            <select 
                                className="form-select rounded-lg border-slate-300 py-2.5 px-3 text-sm focus:outline-none"
                                value={editingUser.role}
                                onChange={e => setEditingUser({...editingUser, role: e.target.value as UserRole})}
                            >
                                <option value="administrator">Administrateur</option>
                                <option value="travel_designer">Concepteur de voyage</option>
                                <option value="sales_agent">Commercial</option>
                                <option value="viewer">Consultation seulement</option>
                            </select>
                        </label>
                        <label className="flex flex-col gap-2">
                            <span className="text-sm font-bold text-slate-700">Avatar (URL optionnelle)</span>
                            <input 
                                type="text" 
                                className="form-input rounded-lg border-slate-300 py-2.5 px-3 text-sm focus:outline-none"
                                placeholder="https://..."
                                value={editingUser.avatarUrl || ''}
                                onChange={e => setEditingUser({...editingUser, avatarUrl: e.target.value})}
                            />
                        </label>
                    </div>

                    <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-100">
                        <button 
                            type="button" 
                            onClick={() => setIsEditing(false)}
                            className="px-4 py-2 text-slate-600 font-bold text-sm hover:bg-slate-100 rounded-lg"
                        >
                            Annuler
                        </button>
                        <button 
                            type="submit" 
                            className="px-6 py-2 bg-primary text-white font-bold text-sm rounded-lg hover:bg-primary/90 shadow-lg shadow-primary/20"
                        >
                            Enregistrer
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
  }

  return (
    <div className="flex flex-1 justify-center py-8 px-4 sm:px-8 animate-fadeIn">
      <div className="flex flex-col max-w-[1200px] w-full gap-8">
        <div className="flex justify-between items-center border-b border-slate-200 pb-6">
            <div>
                <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Gestion Utilisateurs</h1>
                <p className="text-slate-500 text-base">Gérez les accès et les rôles de l'équipe.</p>
            </div>
            <button 
                onClick={handleCreateClick}
                className="flex items-center justify-center rounded-lg h-10 px-6 bg-primary text-white text-sm font-bold shadow-md shadow-primary/20 hover:bg-primary/90 transition-colors"
            >
                <span className="material-symbols-outlined mr-2 text-[18px]">person_add</span>
                Ajouter
            </button>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-xs uppercase text-slate-500 font-semibold">
                        <th className="px-6 py-4">Utilisateur</th>
                        <th className="px-6 py-4">Rôle</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {users.map((user) => (
                        <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div 
                                        className="h-10 w-10 rounded-full bg-slate-200 bg-cover bg-center border border-slate-200 flex items-center justify-center text-slate-400 font-bold uppercase"
                                        style={user.avatarUrl ? { backgroundImage: `url(${user.avatarUrl})` } : {}}
                                    >
                                        {!user.avatarUrl && user.fullName.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-900">{user.fullName}</div>
                                        <div className="text-xs text-slate-500">@{user.username}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${
                                    user.role === 'administrator' 
                                    ? 'bg-purple-100 text-purple-700' 
                                    : user.role === 'travel_designer'
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : user.role === 'sales_agent'
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-slate-100 text-slate-700'
                                }`}>
                                    {getRoleDisplayName(user.role)}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                    <button 
                                        onClick={() => handleEditClick(user)}
                                        className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-full transition-all"
                                        title="Modifier"
                                    >
                                        <span className="material-symbols-outlined text-[20px]">edit</span>
                                    </button>
                                    <button 
                                        onClick={() => {
                                            if (currentUser && user.id === currentUser.id) {
                                                alert("Vous ne pouvez pas vous supprimer vous-même.");
                                                return;
                                            }
                                            if (window.confirm("Supprimer cet utilisateur ?")) deleteUser(user.id);
                                        }}
                                        className={`p-2 rounded-full transition-all ${
                                            (currentUser && user.id === currentUser.id) 
                                            ? 'text-slate-200 cursor-not-allowed' 
                                            : 'text-slate-400 hover:text-red-500 hover:bg-red-50'
                                        }`}
                                        title="Supprimer"
                                        disabled={!!currentUser && user.id === currentUser.id}
                                    >
                                        <span className="material-symbols-outlined text-[20px]">delete</span>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};