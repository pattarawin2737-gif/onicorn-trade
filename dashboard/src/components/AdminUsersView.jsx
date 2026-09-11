import React, { useState, useEffect } from "react";
import { ShieldAlert, UserPlus, Key, Trash2, Eye, EyeOff, Save, Users, ShieldCheck, Search, CheckCircle, Clock } from "lucide-react";

export default function AdminUsersView() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Tab filter: default to 'all' so admins see new registrations immediately!
  const [activeFilter, setActiveFilter] = useState("all");
  
  // Search query state
  const [searchQuery, setSearchQuery] = useState("");

  // Add new user form states
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [roleInput, setRoleInput] = useState("user"); // default to user for new signups
  
  // Inline edit state
  const [editingUsername, setEditingUsername] = useState(null);
  const [editingPassword, setEditingPassword] = useState("");

  // Password visibility states (keyed by username)
  const [visiblePasswords, setVisiblePasswords] = useState({});

  // Fetch users based on selected filter tab
  const fetchUsers = async (filterType = activeFilter) => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/admin-users?filter=${filterType}`);
      if (!response.ok) throw new Error("ไม่สามารถโหลดรายชื่อบัญชีได้");
      const data = await response.json();
      if (data.success) {
        setUsers(data.results || []);
      } else {
        throw new Error(data.error || "เกิดข้อผิดพลาดในการโหลดข้อมูล");
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(activeFilter);
  }, [activeFilter]);

  // Handle switching tabs
  const handleTabChange = (filterType) => {
    setActiveFilter(filterType);
    setEditingUsername(null);
    setSuccessMsg("");
    setError("");
  };

  // Handle adding new user
  const handleAddUser = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    const username = usernameInput.trim();
    const password = passwordInput.trim();

    if (!username || !password) {
      setError("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    try {
      const response = await fetch("/api/admin-users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save",
          username,
          password,
          role: roleInput
        })
      });
      const data = await response.json();
      if (data.success) {
        setSuccessMsg(`เพิ่มผู้ใช้งาน '${username}' เรียบร้อยแล้ว (สิทธิ์: ${roleInput === "admin" ? "Admin" : "User"})`);
        setUsernameInput("");
        setPasswordInput("");
        fetchUsers();
      } else {
        throw new Error(data.error || "ไม่สามารถบันทึกข้อมูลได้");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle updating user's role (Promote / Demote)
  const handleUpdateRole = async (username, currentPassword, newRole) => {
    setError("");
    setSuccessMsg("");

    try {
      const response = await fetch("/api/admin-users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save",
          username,
          password: currentPassword,
          role: newRole
        })
      });
      const data = await response.json();
      if (data.success) {
        setSuccessMsg(`อัปเดตสิทธิ์ของ '${username}' เป็น ${newRole === "admin" ? "แอดมิน (Admin)" : "สมาชิกทั่วไป (User)"} สำเร็จ`);
        fetchUsers();
      } else {
        throw new Error(data.error || "ไม่สามารถเปลี่ยนสิทธิ์การใช้งานได้");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle toggling approval status
  const handleToggleApproval = async (username, currentStatus) => {
    setError("");
    setSuccessMsg("");
    const nextStatus = currentStatus === 1 ? 0 : 1;

    try {
      const response = await fetch("/api/admin-users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          approved: nextStatus
        })
      });
      const data = await response.json();
      if (data.success) {
        setSuccessMsg(`อัปเดตสถานะอนุมัติของ '${username}' เรียบร้อยแล้ว`);
        fetchUsers();
      } else {
        throw new Error(data.error || "ไม่สามารถปรับปรุงสถานะการอนุมัติได้");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle changing password for existing user
  const handleUpdatePassword = async (username, role) => {
    setError("");
    setSuccessMsg("");
    
    if (!editingPassword.trim()) {
      setError("รหัสผ่านใหม่ต้องไม่เป็นค่าว่าง");
      return;
    }

    try {
      const response = await fetch("/api/admin-users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save",
          username,
          password: editingPassword.trim(),
          role
        })
      });
      const data = await response.json();
      if (data.success) {
        setSuccessMsg(`เปลี่ยนรหัสผ่านสำหรับผู้ใช้ '${username}' สำเร็จ`);
        setEditingUsername(null);
        setEditingPassword("");
        fetchUsers();
      } else {
        throw new Error(data.error || "ไม่สามารถอัปเดตรหัสผ่านได้");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle deleting user
  const handleDeleteUser = async (username) => {
    if (!confirm(`คุณแน่ใจใช่หรือไม่ว่าต้องการลบข้อมูลบัญชีของ '${username}' ออกจากระบบอย่างถาวร?`)) {
      return;
    }
    
    setError("");
    setSuccessMsg("");

    try {
      const response = await fetch("/api/admin-users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete",
          username
        })
      });
      const data = await response.json();
      if (data.success) {
        setSuccessMsg(`ลบผู้ใช้งาน '${username}' ออกจากระบบสำเร็จ`);
        fetchUsers();
      } else {
        throw new Error(data.error || "ไม่สามารถลบข้อมูลได้");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const togglePasswordVisibility = (username) => {
    setVisiblePasswords(prev => ({
      ...prev,
      [username]: !prev[username]
    }));
  };

  // Filter users list by search query
  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      
      {/* Page Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <ShieldAlert size={24} style={{ color: "#EF4444" }} />
        <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "700" }}>
          จัดการรหัสผ่านและสิทธิ์ผู้ใช้งาน (User Passwords & Admin Roles)
        </h2>
      </div>

      {/* Filter Tabs */}
      <div style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "16px",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <div className="glass-card sector-tabs-container" style={{
          padding: "6px",
          display: "flex",
          gap: "8px",
          background: "rgba(15, 23, 42, 0.4)",
          borderRadius: "10px",
          border: "1px solid var(--border-color)"
        }}>
          <button
            onClick={() => handleTabChange("all")}
            className={`btn-quick-select ${activeFilter === "all" ? "active" : ""}`}
            style={{ padding: "8px 16px", fontSize: "13px", fontWeight: "bold", display: "flex", alignItems: "center", gap: "6px" }}
          >
            <Users size={15} />
            <span>👥 บัญชีทั้งหมด (All Accounts - จัดการคนสมัครใหม่)</span>
          </button>
          <button
            onClick={() => handleTabChange("admin")}
            className={`btn-quick-select ${activeFilter === "admin" ? "active" : ""}`}
            style={{ padding: "8px 16px", fontSize: "13px", fontWeight: "bold", display: "flex", alignItems: "center", gap: "6px" }}
          >
            <ShieldCheck size={15} />
            <span>⭐ ผู้ดูแลระบบเท่านั้น (Admins Only)</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="input-wrapper" style={{ width: "260px", margin: 0 }}>
          <Search className="input-icon" size={16} style={{ color: "var(--text-muted)" }} />
          <input
            type="text"
            className="form-input"
            placeholder="ค้นหาชื่อผู้ใช้งาน..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ padding: "8px 12px 8px 36px", fontSize: "13.5px" }}
          />
        </div>
      </div>

      <div className="layout-row-50-50" style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
        gap: "24px",
        alignItems: "start"
      }}>
        
        {/* Left Card: Add New User Form */}
        <div className="glass-card" style={{ padding: "24px" }}>
          <h3 className="chart-title" style={{ fontSize: "16px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
            <UserPlus size={18} style={{ color: "var(--color-primary)" }} />
            <span>สร้างบัญชีใหม่จากหลังบ้าน (Backoffice Create)</span>
          </h3>

          <form onSubmit={handleAddUser} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">ชื่อผู้ใช้ (Username)</label>
              <input
                type="text"
                className="form-input"
                placeholder="กรอกชื่อผู้ใช้"
                value={usernameInput}
                onChange={e => setUsernameInput(e.target.value)}
                style={{ padding: "10px 14px" }}
                required
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">รหัสผ่าน (Password)</label>
              <input
                type="password"
                className="form-input"
                placeholder="กรอกรหัสผ่าน"
                value={passwordInput}
                onChange={e => setPasswordInput(e.target.value)}
                style={{ padding: "10px 14px" }}
                required
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">ระดับสิทธิ์ (Role)</label>
              <select 
                className="calc-select" 
                value={roleInput} 
                onChange={e => setRoleInput(e.target.value)}
                style={{ height: "42px", padding: "10px 12px" }}
              >
                <option value="user">สมาชิกทั่วไป (User - เริ่มต้นสำหรับคนทั่วไป)</option>
                <option value="admin">ผู้ดูแลระบบ (Admin)</option>
              </select>
            </div>

            <button type="submit" className="btn-primary" style={{ marginTop: "8px", padding: "12px" }}>
              ➕ สร้างบัญชีใหม่
            </button>
          </form>
        </div>

        {/* Right Card: Users List */}
        <div className="glass-card" style={{ padding: "24px" }}>
          <h3 className="chart-title" style={{ fontSize: "16px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
            {activeFilter === "admin" ? <ShieldCheck size={18} style={{ color: "#EF4444" }} /> : <Users size={18} style={{ color: "var(--color-primary)" }} />}
            <span>
              {activeFilter === "admin" ? "รายชื่อแอดมินทั้งหมด (Admin Accounts)" : "รายชื่อสมาชิกทั้งหมดรวมคนสมัครใหม่ (All Registered Users)"}
            </span>
          </h3>

          {error && (
            <div className="alert-error" style={{ marginBottom: "16px" }}>
              <span>⚠️ {error}</span>
            </div>
          )}

          {successMsg && (
            <div style={{
              background: "rgba(16, 185, 129, 0.1)",
              border: "1px solid var(--color-success)",
              color: "var(--color-success)",
              padding: "12px",
              borderRadius: "8px",
              fontSize: "14px",
              marginBottom: "16px",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}>
              <span>✅ {successMsg}</span>
            </div>
          )}

          <div className="table-wrapper">
            {loading ? (
              <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
                <div className="spinner" style={{ width: "24px", height: "24px", margin: "0 auto 12px auto" }}></div>
                <span>กำลังโหลดข้อมูลบัญชีสมาชิก...</span>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
                <span>ไม่พบข้อมูลบัญชีสมาชิก (หรือไม่มีข้อมูลที่ตรงกับการค้นหา)</span>
              </div>
            ) : (
              <table className="data-table" style={{ width: "100%" }}>
                <thead>
                  <tr style={{ background: "rgba(15, 23, 42, 0.4)", borderBottom: "1px solid var(--border-color)" }}>
                    <th style={{ padding: "12px 14px", color: "var(--text-secondary)" }}>ชื่อผู้ใช้</th>
                    <th style={{ padding: "12px 14px", color: "var(--text-secondary)" }}>รหัสผ่าน</th>
                    <th style={{ padding: "12px 14px", color: "var(--text-secondary)", textAlign: "center" }}>สิทธิ์</th>
                    <th style={{ padding: "12px 14px", color: "var(--text-secondary)", textAlign: "center" }}>อนุมัติการใช้งาน</th>
                    <th style={{ padding: "12px 14px", color: "var(--text-secondary)", textAlign: "center" }}>จัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => {
                    const isVisible = !!visiblePasswords[user.username];
                    const isEditing = editingUsername === user.username;
                    const isAdmin = String(user.role).toLowerCase() === "admin";
                    const isApproved = user.approved === 1 || isAdmin;

                    return (
                      <tr key={user.username} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.05)" }}>
                        <td style={{ padding: "12px 14px", fontWeight: "bold", color: "#fff" }}>
                          {user.username}
                        </td>
                        <td style={{ padding: "12px 14px" }}>
                          {isEditing ? (
                            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                              <input
                                type="text"
                                className="form-input"
                                value={editingPassword}
                                onChange={e => setEditingPassword(e.target.value)}
                                style={{ padding: "4px 8px", fontSize: "13px", height: "30px", width: "100px" }}
                              />
                              <button
                                onClick={() => handleUpdatePassword(user.username, user.role)}
                                className="btn-quick-select active"
                                style={{ padding: "4px 6px", height: "30px", fontSize: "11px", margin: 0 }}
                                title="บันทึกรหัสผ่านใหม่"
                              >
                                <Save size={14} />
                              </button>
                            </div>
                          ) : (
                            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                              <span style={{ fontFamily: "monospace", fontSize: "13.5px", color: isVisible ? "#fff" : "var(--text-muted)" }}>
                                {isVisible ? user.password : "••••••••"}
                              </span>
                              <button
                                onClick={() => togglePasswordVisibility(user.username)}
                                style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", display: "flex", alignItems: "center" }}
                              >
                                {isVisible ? <EyeOff size={14} /> : <Eye size={14} />}
                              </button>
                            </div>
                          )}
                        </td>
                        <td style={{ padding: "12px 14px", textAlign: "center" }}>
                          <button
                            onClick={() => handleUpdateRole(user.username, user.password, isAdmin ? "user" : "admin")}
                            className={`badge ${isAdmin ? "badge-win" : "badge-be"}`}
                            style={{ 
                              fontSize: "11px", 
                              padding: "4px 10px", 
                              cursor: "pointer",
                              border: isAdmin ? "1px solid rgba(16, 185, 129, 0.4)" : "1px solid rgba(255, 255, 255, 0.15)",
                              background: isAdmin ? "var(--color-success-glow)" : "rgba(255, 255, 255, 0.05)"
                            }}
                            title={isAdmin ? "คลิกเพื่อยกเลิกสิทธิ์ Admin" : "คลิกเพื่อแต่งตั้งเป็น Admin"}
                          >
                            {isAdmin ? "⭐ Admin" : "👤 User"}
                          </button>
                        </td>
                        <td style={{ padding: "12px 14px", textAlign: "center" }}>
                          {isAdmin ? (
                            <span style={{ color: "var(--color-success)", fontSize: "12.5px", fontWeight: "bold" }}>
                              ✓ อนุมัติอัตโนมัติ
                            </span>
                          ) : (
                            <button
                              onClick={() => handleToggleApproval(user.username, user.approved)}
                              className={`badge ${isApproved ? "badge-win" : "badge-loss"}`}
                              style={{
                                fontSize: "11px",
                                padding: "4px 10px",
                                cursor: "pointer",
                                border: isApproved ? "1px solid rgba(16, 185, 129, 0.4)" : "1px solid rgba(239, 68, 68, 0.4)",
                                background: isApproved ? "var(--color-success-glow)" : "rgba(239, 68, 68, 0.1)",
                                animation: !isApproved ? "pulse 2s infinite" : "none"
                              }}
                              title={isApproved ? "คลิกเพื่อยกเลิกการอนุมัติการใช้งาน" : "คลิกเพื่ออนุมัติให้บัญชีเข้าใช้งานได้"}
                            >
                              {isApproved ? "✅ อนุมัติแล้ว" : "⏳ รอการอนุมัติ"}
                            </button>
                          )}
                        </td>
                        <td style={{ padding: "12px 14px", textAlign: "center" }}>
                          <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                            <button
                              onClick={() => {
                                if (isEditing) {
                                  setEditingUsername(null);
                                } else {
                                  setEditingUsername(user.username);
                                  setEditingPassword(user.password);
                                }
                              }}
                              className="btn-quick-select"
                              style={{ padding: "4px 8px", fontSize: "11px", margin: 0 }}
                            >
                              {isEditing ? "ยกเลิก" : "✏️ แก้ไข"}
                            </button>
                            
                            <button
                              onClick={() => handleDeleteUser(user.username)}
                              style={{
                                background: "rgba(239, 68, 68, 0.15)",
                                color: "#ef4444",
                                border: "none",
                                borderRadius: "4px",
                                padding: "4px 8px",
                                cursor: "pointer",
                                fontSize: "11px",
                                display: "flex",
                                alignItems: "center",
                                gap: "4px"
                              }}
                              title="ลบบัญชีและสิทธิ์ออกจากระบบ"
                            >
                              <Trash2 size={13} /> ลบ
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
          
          <div style={{ marginTop: "16px", fontSize: "11.5px", color: "var(--text-muted)", lineHeight: "1.5" }}>
            📌 <strong>การอนุมัติสมาชิกใหม่:</strong> เมื่อมีผู้ใช้สมัครสมาชิกเข้ามาใหม่ ระบบจะตั้งค่าเป็น ⏳ <strong>รอการอนุมัติ</strong> แอดมินสามารถคลิกที่ปุ่มสถานะสีแดงนี้เพื่อสลับเป็น ✅ <strong>อนุมัติแล้ว</strong> เพื่อให้สมาชิกเริ่มล็อกอินใช้งานรหัสได้ทันที
          </div>
        </div>

      </div>
    </div>
  );
}
