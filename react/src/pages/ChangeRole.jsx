import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import PrimaryButton, { SecondaryButton } from "../components/Buttons";
import {
  FetchJson,
  GetErrorMessage,
  ReadStoredUser,
  UpdateStoredUser,
} from "../api";
import { useMessage } from "../hooks/useMessage";

const inputClassName =
  "mt-2 block w-full rounded-md bg-white/5 px-3 py-1.5 outline-1 -outline-offset-1 outline-white/10 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6";

const emptyFormState = {
  firstName: "",
  lastName: "",
  email: "",
  dateOfBirth: "",
  roleCode: "",
  isActive: "true",
  phoneNumber: "",
  address: "",
};

function BuildUserRecordKey(user) {
  if (!user) {
    return "";
  }

  return `${user.userType}:${user.userId}`;
}

function BuildFormState(user) {
  if (!user) {
    return emptyFormState;
  }

  return {
    firstName: user.firstName ?? "",
    lastName: user.lastName ?? "",
    email: user.email ?? "",
    dateOfBirth: user.dateOfBirth ? String(user.dateOfBirth).slice(0, 10) : "",
    roleCode: String(user.roleCode ?? ""),
    isActive: user.isActive ? "true" : "false",
    phoneNumber: user.phoneNumber ?? "",
    address: user.address ?? "",
  };
}

function BuildUserTitle(user) {
  if (!user) {
    return "";
  }

  return user.userType === "staff"
    ? `Staff #${user.userId}`
    : `Patron #${user.userId}`;
}

export default function ChangeRole() {
  const navigate = useNavigate();
  const { showSuccess, showError, showWarning, showInfo } = useMessage();
  const storedUser = ReadStoredUser();
  const userKey = storedUser
    ? `${storedUser.user_type ?? ""}:${storedUser.staff_id ?? ""}:${storedUser.role ?? ""}`
    : "";

  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUserKey, setSelectedUserKey] = useState("");
  const [formState, setFormState] = useState(emptyFormState);

  const [patronRoles, setPatronRoles] = useState([]);
  const [staffRoles, setStaffRoles] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(true);

  const [listLoading, setListLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [searchInput, setSearchInput] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [userTypeFilter, setUserTypeFilter] = useState("all");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const currentUser = ReadStoredUser();

    if (!currentUser) {
      navigate("/login", { replace: true });
      return;
    }

    if (currentUser.user_type !== "staff" || Number(currentUser.role) !== 2) {
      navigate("/", { replace: true });
    }
  }, [navigate, userKey]);

  useEffect(() => {
    let isMounted = true;

    async function LoadRoles() {
      try {
        setRolesLoading(true);
        const [patronRoleData, staffRoleData] = await Promise.all([
          FetchJson("/api/patronroles"),
          FetchJson("/api/staffroles"),
        ]);

        if (!isMounted) {
          return;
        }

        setPatronRoles(Array.isArray(patronRoleData) ? patronRoleData : []);
        setStaffRoles(Array.isArray(staffRoleData) ? staffRoleData : []);
      } catch (error) {
        if (isMounted) {
          showError(GetErrorMessage(error, "Failed to load role options."));
        }
      } finally {
        if (isMounted) {
          setRolesLoading(false);
        }
      }
    }

    LoadRoles();

    return () => {
      isMounted = false;
    };
  }, [showError]);

  useEffect(() => {
    let isMounted = true;
    const currentUser = ReadStoredUser();

    if (!currentUser || currentUser.user_type !== "staff" || Number(currentUser.role) !== 2) {
      return () => {
        isMounted = false;
      };
    }

    async function LoadUsers() {
      try {
        setListLoading(true);
        const params = new URLSearchParams();
        params.set("userType", userTypeFilter);

        if (submittedSearch.trim()) {
          params.set("q", submittedSearch.trim());
        }

        const data = await FetchJson(`/api/admin/users?${params.toString()}`);
        const nextUsers = Array.isArray(data) ? data : [];

        if (!isMounted) {
          return;
        }

        setUsers(nextUsers);

        const nextSelectedUser =
          nextUsers.find((user) => BuildUserRecordKey(user) === selectedUserKey) ??
          nextUsers[0] ??
          null;

        setSelectedUser(nextSelectedUser);
        setSelectedUserKey(BuildUserRecordKey(nextSelectedUser));
        setFormState(BuildFormState(nextSelectedUser));
      } catch (error) {
        if (isMounted) {
          setUsers([]);
          setSelectedUser(null);
          setSelectedUserKey("");
          setFormState(emptyFormState);
          showError(GetErrorMessage(error, "Failed to load users."));
        }
      } finally {
        if (isMounted) {
          setListLoading(false);
        }
      }
    }

    LoadUsers();

    return () => {
      isMounted = false;
    };
  }, [userKey, userTypeFilter, submittedSearch, refreshKey, showError]);

  const selectedRoleOptions = useMemo(() => {
    if (!selectedUser) {
      return [];
    }

    return selectedUser.userType === "staff" ? staffRoles : patronRoles;
  }, [selectedUser, staffRoles, patronRoles]);

  function HandleSelectUser(user) {
    setSelectedUser(user);
    setSelectedUserKey(BuildUserRecordKey(user));
    setFormState(BuildFormState(user));
  }

  function HandleSearchSubmit(event) {
    event.preventDefault();
    setSubmittedSearch(searchInput.trim());
  }

  function HandleResetFilters() {
    setSearchInput("");
    setSubmittedSearch("");
    setUserTypeFilter("all");
    showInfo("User filters reset.");
  }

  async function HandleSave(event) {
    event.preventDefault();

    if (!selectedUser) {
      showWarning("Choose a user to edit first.");
      return;
    }

    const payload = {
      firstName: formState.firstName,
      lastName: formState.lastName,
      email: formState.email,
      dateOfBirth: formState.dateOfBirth,
      roleCode: Number(formState.roleCode),
      isActive: formState.isActive === "true",
      phoneNumber: formState.phoneNumber,
      address: formState.address,
    };

    try {
      setSaving(true);
      await FetchJson(
        `/api/admin/users/${selectedUser.userType}/${selectedUser.userId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const currentUser = ReadStoredUser();

      if (
        currentUser &&
        currentUser.user_type === selectedUser.userType &&
        Number(currentUser.staff_id ?? currentUser.patron_id) === Number(selectedUser.userId)
      ) {
        UpdateStoredUser({
          first_name: formState.firstName,
          last_name: formState.lastName,
          email: formState.email,
          role: Number(formState.roleCode),
        });
      }

      showSuccess("User updated successfully.");
      setRefreshKey((current) => current + 1);
    } catch (error) {
      showError(GetErrorMessage(error, "Failed to update user."));
    } finally {
      setSaving(false);
    }
  }

  async function HandleDelete() {
    if (!selectedUser) {
      showWarning("Choose a user to delete first.");
      return;
    }

    const confirmed = window.confirm(
      `Delete ${BuildUserTitle(selectedUser)}? This cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);
      await FetchJson(
        `/api/admin/users/${selectedUser.userType}/${selectedUser.userId}`,
        {
          method: "DELETE",
        }
      );

      showSuccess("User deleted successfully.");
      setSelectedUser(null);
      setSelectedUserKey("");
      setFormState(emptyFormState);
      setRefreshKey((current) => current + 1);
    } catch (error) {
      showError(GetErrorMessage(error, "Failed to delete user."));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <section className="space-y-6 rounded-3xl border border-white/10 bg-slate-900/70 p-8 shadow-xl shadow-slate-950/30">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-300">
          Admin
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white">
          User Management
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
          Search, update, and delete patron or staff accounts here. New patron and
          staff records are still created through the registration pages.
        </p>
      </div>

      <form
        onSubmit={HandleSearchSubmit}
        className="grid gap-4 rounded-2xl border border-white/10 bg-slate-950/40 p-5 lg:grid-cols-[1.2fr_220px_auto_auto]"
      >
        <div>
          <label htmlFor="user-search" className="text-sm text-slate-200">
            Search by ID, name, email, phone, or address
          </label>
          <input
            id="user-search"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            className={inputClassName}
            placeholder="Search users"
          />
        </div>

        <div>
          <label htmlFor="user-type-filter" className="text-sm text-slate-200">
            Account Type
          </label>
          <select
            id="user-type-filter"
            value={userTypeFilter}
            onChange={(event) => setUserTypeFilter(event.target.value)}
            className={inputClassName}
          >
            <option value="all" style={{ color: "#0f172a", backgroundColor: "#ffffff" }}>
              All Accounts
            </option>
            <option value="patron" style={{ color: "#0f172a", backgroundColor: "#ffffff" }}>
              Patrons
            </option>
            <option value="staff" style={{ color: "#0f172a", backgroundColor: "#ffffff" }}>
              Staff
            </option>
          </select>
        </div>

        <div className="flex items-end">
          <PrimaryButton title="Search" type="submit" />
        </div>

        <div className="flex items-end">
          <SecondaryButton title="Reset" onClick={HandleResetFilters} />
        </div>
      </form>

      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="rounded-2xl border border-white/10 bg-slate-950/40 p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Accounts</h2>
            <span className="text-sm text-slate-400">{users.length}</span>
          </div>

          {listLoading ? <p className="mt-4 text-slate-300">Loading users...</p> : null}

          {!listLoading && users.length === 0 ? (
            <p className="mt-4 text-slate-300">
              No users match the current filters.
            </p>
          ) : null}

          <div className="mt-4 space-y-3">
            {users.map((user) => {
              const isSelected = BuildUserRecordKey(user) === selectedUserKey;

              return (
                <button
                  key={BuildUserRecordKey(user)}
                  type="button"
                  onClick={() => HandleSelectUser(user)}
                  className={`w-full rounded-2xl border px-4 py-4 text-left transition ${isSelected
                      ? "border-sky-400/40 bg-sky-400/10"
                      : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
                    }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-white">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-sm text-slate-400">{BuildUserTitle(user)}</p>
                    </div>
                    <span className="rounded-full border border-white/10 px-2 py-1 text-xs uppercase tracking-[0.2em] text-slate-300">
                      {user.userType}
                    </span>
                  </div>

                  <p className="mt-3 text-sm text-slate-300">{user.email}</p>
                  <p className="mt-1 text-sm text-slate-400">
                    {user.roleName || `Role ${user.roleCode}`} ·{" "}
                    {user.isActive ? "Active" : "Inactive"}
                  </p>
                </button>
              );
            })}
          </div>
        </aside>

        <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-6">
          {!selectedUser ? (
            <div className="flex min-h-72 items-center justify-center text-center text-slate-300">
              Choose a user from the left to edit or delete that account.
            </div>
          ) : (
            <form onSubmit={HandleSave} className="space-y-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-300">
                    {selectedUser.userType === "staff" ? "Staff Account" : "Patron Account"}
                  </p>
                  <h2 className="mt-2 text-3xl font-semibold text-white">
                    {selectedUser.firstName} {selectedUser.lastName}
                  </h2>
                  <p className="mt-2 text-sm text-slate-400">
                    {BuildUserTitle(selectedUser)}
                  </p>
                </div>

                <div className="flex gap-2">
                  <PrimaryButton
                    title={saving ? "Saving..." : "Save Changes"}
                    type="submit"
                    disabledValue={saving || deleting || rolesLoading}
                  />
                  <SecondaryButton
                    title={deleting ? "Deleting..." : "Delete User"}
                    onClick={HandleDelete}
                    disabled={saving || deleting}
                  />
                </div>
              </div>

              {rolesLoading ? (
                <p className="text-slate-300">
                  Loading role options...
                </p>
              ) : null}

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor="firstName" className="text-sm text-slate-200">
                    First Name
                  </label>
                  <input
                    id="firstName"
                    value={formState.firstName}
                    onChange={(event) => setFormState((current) => ({
                      ...current,
                      firstName: event.target.value,
                    }))}
                    className={inputClassName}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="lastName" className="text-sm text-slate-200">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    value={formState.lastName}
                    onChange={(event) => setFormState((current) => ({
                      ...current,
                      lastName: event.target.value,
                    }))}
                    className={inputClassName}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="email" className="text-sm text-slate-200">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={formState.email}
                    onChange={(event) => setFormState((current) => ({
                      ...current,
                      email: event.target.value,
                    }))}
                    className={inputClassName}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="dateOfBirth" className="text-sm text-slate-200">
                    Date of Birth
                  </label>
                  <input
                    id="dateOfBirth"
                    type="date"
                    value={formState.dateOfBirth}
                    onChange={(event) => setFormState((current) => ({
                      ...current,
                      dateOfBirth: event.target.value,
                    }))}
                    className={inputClassName}
                    required={selectedUser.userType === "staff"}
                  />
                </div>

                <div>
                  <label htmlFor="roleCode" className="text-sm text-slate-200">
                    Role
                  </label>
                  <select
                    id="roleCode"
                    value={formState.roleCode}
                    onChange={(event) => setFormState((current) => ({
                      ...current,
                      roleCode: event.target.value,
                    }))}
                    className={inputClassName}
                    required
                  >
                    <option value="" style={{ color: "#0f172a", backgroundColor: "#ffffff" }}>
                      Select a role
                    </option>
                    {selectedRoleOptions.map((role) => {
                      const keys = Object.keys(role);
                      const codeKey = keys[0];
                      const labelKey = keys[1];

                      return (
                        <option
                          key={role[codeKey]}
                          value={role[codeKey]}
                          style={{ color: "#0f172a", backgroundColor: "#ffffff" }}
                        >
                          {role[labelKey]}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label htmlFor="isActive" className="text-sm text-slate-200">
                    Status
                  </label>
                  <select
                    id="isActive"
                    value={formState.isActive}
                    onChange={(event) => setFormState((current) => ({
                      ...current,
                      isActive: event.target.value,
                    }))}
                    className={inputClassName}
                    required
                  >
                    <option value="true" style={{ color: "#0f172a", backgroundColor: "#ffffff" }}>
                      Active
                    </option>
                    <option value="false" style={{ color: "#0f172a", backgroundColor: "#ffffff" }}>
                      Inactive
                    </option>
                  </select>
                </div>

                {selectedUser.userType === "staff" ? (
                  <>
                    <div>
                      <label htmlFor="phoneNumber" className="text-sm text-slate-200">
                        Phone Number
                      </label>
                      <input
                        id="phoneNumber"
                        value={formState.phoneNumber}
                        onChange={(event) => setFormState((current) => ({
                          ...current,
                          phoneNumber: event.target.value,
                        }))}
                        className={inputClassName}
                        placeholder="10 digits"
                      />
                    </div>

                    <div>
                      <label htmlFor="address" className="text-sm text-slate-200">
                        Address
                      </label>
                      <input
                        id="address"
                        value={formState.address}
                        onChange={(event) => setFormState((current) => ({
                          ...current,
                          address: event.target.value,
                        }))}
                        className={inputClassName}
                        required
                      />
                    </div>
                  </>
                ) : null}
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
