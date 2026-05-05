import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Plus, Clock, User as UserIcon, Calendar, CheckSquare, AlignLeft, Users, X } from 'lucide-react';
import './TaskBoard.css';

const TaskBoard = () => {
  const { id } = useParams();
  const [tasks, setTasks] = useState([]);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  
  const [showModal, setShowModal] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'medium', status: 'todo', assignee: '', dueDate: '' });

  useEffect(() => {
    fetchProjectAndTasks();
    if (user?.role === 'admin') {
      fetchAllUsers();
    }
  }, [id, user]);

  const fetchAllUsers = async () => {
    try {
      const { data } = await api.get('/users');
      setAllUsers(data.data.users);
    } catch (err) {
      console.error('Failed to fetch users', err);
    }
  };

  const fetchProjectAndTasks = async () => {
    try {
      const [projRes, taskRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/tasks?project=${id}`)
      ]);
      setProject(projRes.data.data.project);
      setTasks(taskRes.data.data.tasks);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (userId) => {
    try {
      await api.post(`/projects/${id}/members`, { userId });
      fetchProjectAndTasks();
    } catch (err) {
      alert(err.response?.data?.message || 'Error adding member');
    }
  };

  const handleRemoveMember = async (userId) => {
    try {
      await api.delete(`/projects/${id}/members/${userId}`);
      fetchProjectAndTasks();
    } catch (err) {
      alert(err.response?.data?.message || 'Error removing member');
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...newTask, project: id };
      if (!payload.assignee) delete payload.assignee;
      if (!payload.dueDate) delete payload.dueDate;
      
      await api.post('/tasks', payload);
      setShowModal(false);
      setNewTask({ title: '', description: '', priority: 'medium', status: 'todo', assignee: '', dueDate: '' });
      fetchProjectAndTasks();
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating task');
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await api.patch(`/tasks/${taskId}`, { status: newStatus });
      fetchProjectAndTasks();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  if (loading) return <div className="loading">Loading board...</div>;

  const statuses = ['todo', 'in_progress', 'review', 'done'];

  return (
    <div className="task-board-page animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">{project?.name} - Board</h1>
          <p className="project-subtitle">{project?.description}</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          {user?.role === 'admin' && (
            <button className="btn btn-secondary" onClick={() => setShowTeamModal(true)}>
              <Users size={18} /> Manage Team
            </button>
          )}
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={18} /> New Task
          </button>
        </div>
      </div>

      <div className="kanban-board">
        {statuses.map(status => (
          <div key={status} className="kanban-column glass-panel">
            <div className="kanban-column-header">
              <h3 className="column-title">
                {status.replace('_', ' ').toUpperCase()}
              </h3>
              <span className="task-count">
                {tasks.filter(t => t.status === status).length}
              </span>
            </div>
            
            <div className="kanban-cards">
              {tasks.filter(t => t.status === status).map(task => (
                <div key={task._id} className="task-card">
                  <div className={`priority-indicator priority-${task.priority}`}></div>
                  <h4>{task.title}</h4>
                  {task.description && (
                    <p className="task-desc"><AlignLeft size={14} /> {task.description}</p>
                  )}
                  <div className="task-meta">
                    <div className="task-assignee">
                      <UserIcon size={14} /> {task.assignee?.name || 'Unassigned'}
                    </div>
                    {task.dueDate && (
                      <div className={`task-date ${task.isOverdue ? 'overdue' : ''}`}>
                        <Calendar size={14} /> 
                        {new Date(task.dueDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  
                  <div className="task-actions">
                    <select 
                      className="status-select" 
                      value={task.status} 
                      onChange={(e) => handleStatusChange(task._id, e.target.value)}
                    >
                      {statuses.map(s => (
                        <option key={s} value={s}>{s.replace('_', ' ')}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content glass-panel" onClick={e => e.stopPropagation()}>
            <h2>Create New Task</h2>
            <form onSubmit={handleCreateTask}>
              <div className="input-group">
                <label>Task Title</label>
                <input 
                  type="text" className="input-field" 
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  required 
                />
              </div>
              <div className="input-group">
                <label>Description</label>
                <textarea 
                  className="input-field" 
                  value={newTask.description}
                  onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                  rows="3"
                />
              </div>
              <div className="input-group">
                <label>Assignee</label>
                <select 
                  className="input-field"
                  value={newTask.assignee}
                  onChange={(e) => setNewTask({...newTask, assignee: e.target.value})}
                >
                  <option value="">Unassigned</option>
                  {project?.members.map(member => (
                    <option key={member._id} value={member._id}>{member.name}</option>
                  ))}
                </select>
              </div>
              <div className="input-group">
                <label>Due Date</label>
                <input 
                  type="date" 
                  className="input-field" 
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                />
              </div>
              <div className="input-group">
                <label>Priority</label>
                <select 
                  className="input-field"
                  value={newTask.priority}
                  onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Task</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showTeamModal && (
        <div className="modal-overlay" onClick={() => setShowTeamModal(false)}>
          <div className="modal-content glass-panel" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2>Manage Team</h2>
              <button onClick={() => setShowTeamModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><X size={24} /></button>
            </div>
            
            <div className="team-management">
              <div style={{ marginBottom: '2rem' }}>
                <h3>Current Members</h3>
                <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  {project?.members.map(member => (
                    <div key={member._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.8rem', background: 'var(--bg-tertiary)', borderRadius: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                        <div className="avatar" style={{ width: '32px', height: '32px', fontSize: '0.9rem' }}>{member.name.charAt(0).toUpperCase()}</div>
                        <div>
                          <div style={{ fontWeight: '500' }}>{member.name}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{member.email}</div>
                        </div>
                      </div>
                      <button className="btn btn-danger" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => handleRemoveMember(member._id)}>Remove</button>
                    </div>
                  ))}
                  {project?.members.length === 0 && <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No members yet.</div>}
                </div>
              </div>

              <div>
                <h3>Available Users</h3>
                <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.8rem', maxHeight: '250px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                  {allUsers.filter(u => u._id !== project?.owner?._id && !project?.members.find(m => m._id === u._id)).map(user => (
                    <div key={user._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.8rem', background: 'var(--bg-main)', border: '1px solid var(--glass-border)', borderRadius: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                        <div className="avatar" style={{ width: '32px', height: '32px', fontSize: '0.9rem', background: 'var(--bg-tertiary)' }}>{user.name.charAt(0).toUpperCase()}</div>
                        <div>
                          <div style={{ fontWeight: '500' }}>{user.name}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{user.email}</div>
                        </div>
                      </div>
                      <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => handleAddMember(user._id)}>Add</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskBoard;
