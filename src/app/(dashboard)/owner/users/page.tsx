"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Plus, MoreVertical, Edit2, ToggleLeft, ToggleRight } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string | null;
  isActive: boolean;
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const roleTabs = [
  { value: "", label: "Semua" },
  { value: "owner", label: "Owner" },
  { value: "dokter", label: "Dokter" },
  { value: "staff", label: "Staff" },
  { value: "customer", label: "Customer" },
];

const roleOptions = [
  { value: "owner", label: "Owner" },
  { value: "dokter", label: "Dokter" },
  { value: "staff", label: "Staff" },
  { value: "customer", label: "Customer" },
];

export default function OwnerUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(1);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  // Form states
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formRole, setFormRole] = useState("customer");
  const [formPhone, setFormPhone] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (roleFilter) params.set("role", roleFilter);
      if (search) params.set("search", search);
      params.set("page", String(page));
      params.set("limit", "20");

      const res = await fetch(`/api/users?${params}`);
      const json = await res.json();

      if (res.ok) {
        setUsers(json.data.users);
        setPagination(json.data.pagination);
      } else {
        toast.error(json.error ?? "Gagal memuat data");
      }
    } catch {
      toast.error("Gagal memuat data");
    } finally {
      setLoading(false);
    }
  }, [roleFilter, search, page]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormLoading(true);

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName,
          email: formEmail,
          password: formPassword,
          role: formRole,
          phone: formPhone || undefined,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setFormError(json.error ?? "Gagal membuat user");
        setFormLoading(false);
        return;
      }

      toast.success("User berhasil dibuat");
      setShowCreateModal(false);
      resetForm();
      fetchUsers();
    } catch {
      setFormError("Terjadi kesalahan");
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setFormError(null);
    setFormLoading(true);

    try {
      const body: Record<string, string | null> = {};
      if (formName !== selectedUser.name) body["name"] = formName;
      if (formPhone !== (selectedUser.phone ?? "")) body["phone"] = formPhone || null;
      if (formRole !== selectedUser.role) body["role"] = formRole;
      if (formPassword) body["password"] = formPassword;

      if (Object.keys(body).length === 0) {
        setFormError("Tidak ada perubahan");
        setFormLoading(false);
        return;
      }

      const res = await fetch(`/api/users/${selectedUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const json = await res.json();

      if (!res.ok) {
        setFormError(json.error ?? "Gagal mengupdate user");
        setFormLoading(false);
        return;
      }

      toast.success("User berhasil diupdate");
      setShowEditModal(false);
      resetForm();
      fetchUsers();
    } catch {
      setFormError("Terjadi kesalahan");
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggleActive = async () => {
    if (!selectedUser) return;
    setFormLoading(true);

    try {
      const res = await fetch(`/api/users/${selectedUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !selectedUser.isActive }),
      });

      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error ?? "Gagal mengubah status");
        setFormLoading(false);
        return;
      }

      toast.success(selectedUser.isActive ? "User dinonaktifkan" : "User diaktifkan");
      setShowConfirmDialog(false);
      setSelectedUser(null);
      fetchUsers();
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setFormLoading(false);
    }
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setFormName(user.name);
    setFormPhone(user.phone ?? "");
    setFormRole(user.role);
    setFormPassword("");
    setFormError(null);
    setShowEditModal(true);
    setOpenDropdownId(null);
  };

  const openToggleDialog = (user: User) => {
    setSelectedUser(user);
    setShowConfirmDialog(true);
    setOpenDropdownId(null);
  };

  const resetForm = () => {
    setFormName("");
    setFormEmail("");
    setFormPassword("");
    setFormRole("customer");
    setFormPhone("");
    setFormError(null);
    setSelectedUser(null);
  };

  const columns = [
    { key: "name", header: "Nama" },
    { key: "email", header: "Email" },
    {
      key: "role",
      header: "Role",
      render: (item: User) => <Badge value={item.role} />,
    },
    {
      key: "isActive",
      header: "Status",
      render: (item: User) => (
        <Badge value={item.isActive ? "active" : "inactive"} />
      ),
    },
    { key: "phone", header: "Telepon" },
    {
      key: "actions",
      header: "Aksi",
      render: (item: User) => (
        <div className="relative">
          <button
            onClick={() => setOpenDropdownId(openDropdownId === item.id ? null : item.id)}
            className="rounded-md p-1 hover:bg-gray-100"
          >
            <MoreVertical className="h-4 w-4 text-gray-500" />
          </button>
          {openDropdownId === item.id && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setOpenDropdownId(null)}
              />
              <div className="absolute right-0 z-20 mt-1 w-40 rounded-md border bg-white shadow-lg">
                <button
                  onClick={() => openEditModal(item)}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Edit2 className="h-4 w-4" />
                  Edit
                </button>
                <button
                  onClick={() => openToggleDialog(item)}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  {item.isActive ? (
                    <ToggleLeft className="h-4 w-4 text-red-500" />
                  ) : (
                    <ToggleRight className="h-4 w-4 text-emerald-500" />
                  )}
                  {item.isActive ? "Nonaktifkan" : "Aktifkan"}
                </button>
              </div>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manajemen User"
        subtitle="Kelola semua pengguna sistem"
        actions={
          <button
            onClick={() => {
              resetForm();
              setShowCreateModal(true);
            }}
            className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Tambah User
          </button>
        }
      />

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {roleTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => {
              setRoleFilter(tab.value);
              setPage(1);
            }}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              roleFilter === tab.value
                ? "bg-emerald-100 text-emerald-700"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={users}
        loading={loading}
        searchable
        pagination
        pageSize={20}
      />

      {/* Create Modal */}
      <Modal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Tambah User Baru"
        size="md"
        footer={
          <>
            <button
              onClick={() => setShowCreateModal(false)}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Batal
            </button>
            <button
              onClick={handleCreate}
              disabled={formLoading}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              {formLoading ? "Menyimpan..." : "Simpan"}
            </button>
          </>
        }
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Nama"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            required
            placeholder="Nama lengkap"
          />
          <Input
            label="Email"
            type="email"
            value={formEmail}
            onChange={(e) => setFormEmail(e.target.value)}
            required
            placeholder="user@email.com"
          />
          <Input
            label="Password"
            type="password"
            value={formPassword}
            onChange={(e) => setFormPassword(e.target.value)}
            required
            placeholder="Minimal 6 karakter"
          />
          <Select
            label="Role"
            value={formRole}
            onChange={(e) => setFormRole(e.target.value)}
            options={roleOptions}
            required
          />
          <Input
            label="Telepon"
            value={formPhone}
            onChange={(e) => setFormPhone(e.target.value)}
            placeholder="08xxxxxxxxxx"
          />
          {formError && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {formError}
            </div>
          )}
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit User"
        size="md"
        footer={
          <>
            <button
              onClick={() => setShowEditModal(false)}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Batal
            </button>
            <button
              onClick={handleEdit}
              disabled={formLoading}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              {formLoading ? "Menyimpan..." : "Simpan"}
            </button>
          </>
        }
      >
        <form onSubmit={handleEdit} className="space-y-4">
          <Input
            label="Nama"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            required
          />
          <Input
            label="Telepon"
            value={formPhone}
            onChange={(e) => setFormPhone(e.target.value)}
          />
          <Select
            label="Role"
            value={formRole}
            onChange={(e) => setFormRole(e.target.value)}
            options={roleOptions}
            required
          />
          <Input
            label="Password Baru (kosongkan jika tidak diubah)"
            type="password"
            value={formPassword}
            onChange={(e) => setFormPassword(e.target.value)}
            placeholder="Minimal 6 karakter"
          />
          {formError && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {formError}
            </div>
          )}
        </form>
      </Modal>

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={showConfirmDialog}
        onConfirm={handleToggleActive}
        onCancel={() => {
          setShowConfirmDialog(false);
          setSelectedUser(null);
        }}
        title={selectedUser?.isActive ? "Nonaktifkan User" : "Aktifkan User"}
        description={
          selectedUser
            ? selectedUser.isActive
              ? `Apakah Anda yakin ingin menonaktifkan ${selectedUser.name}? User ini tidak akan bisa login.`
              : `Apakah Anda yakin ingin mengaktifkan ${selectedUser.name}?`
            : ""
        }
        confirmLabel={selectedUser?.isActive ? "Nonaktifkan" : "Aktifkan"}
        danger={selectedUser?.isActive ?? false}
      />
    </div>
  );
}