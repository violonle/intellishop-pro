import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { acquisitionService, type FissionTask } from '../../services/acquisitionService';

const FissionToolList: React.FC = () => {
    const navigate = useNavigate();
    const [tasks, setTasks] = useState<FissionTask[]>([]);
    const [loading, setLoading] = useState(true);

    const loadTasks = () => {
        setLoading(true);
        acquisitionService.listFissionTasks()
            .then(setTasks)
            .catch(() => setTasks([]))
            .finally(() => setLoading(false));
    };

    useEffect(loadTasks, []);

    const toggleTask = async (task: FissionTask) => {
        await acquisitionService.toggleFissionTaskStatus(task.id);
        loadTasks();
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white p-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
                <button onClick={() => navigate(-1)}><ArrowLeft /></button>
                <h1 className="text-lg font-bold">裂变工具</h1>
                <div className="w-6" />
            </div>
            <div className="p-4 space-y-3">
                <div className="flex justify-end">
                    <button onClick={loadTasks} className="p-2 text-gray-500" aria-label="刷新"><RefreshCw className="w-4 h-4" /></button>
                </div>
                {loading ? <div className="text-center text-gray-400 py-10">加载中...</div> : tasks.length === 0 ? (
                    <div className="text-center text-gray-400 py-10">暂无裂变任务</div>
                ) : tasks.map(task => (
                    <div key={task.id} className="bg-white rounded-xl p-4 shadow-sm flex items-center justify-between">
                        <div>
                            <div className="font-medium">{task.name}</div>
                            <div className="text-xs text-gray-400 mt-1">{task.type}</div>
                        </div>
                        <button onClick={() => toggleTask(task)} className="text-xs text-blue-600">
                            {task.status === 1 ? '停用' : '启用'}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FissionToolList;
