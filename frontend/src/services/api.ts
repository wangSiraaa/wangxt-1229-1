import axios from 'axios';
import type {
  WorkPermit,
  WorkPermitDetail,
  GasDetection,
  IsolationPoint,
  PersonnelEntry,
  PageResult,
  CreateWorkPermitRequest,
  ApproveActionRequest,
  RecordGasDetectionRequest,
  CreateIsolationPointRequest,
  PersonnelOperationRequest,
  PermitStatus,
} from '../types';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || error.message || '请求失败';
    return Promise.reject(new Error(message));
  }
);

export const workPermitApi = {
  listPermits: (params?: {
    page?: number;
    size?: number;
    statuses?: PermitStatus[];
  }): Promise<PageResult<WorkPermit>> => {
    return api.get('/work-permits', {
      params: {
        page: params?.page || 0,
        size: params?.size || 20,
        statuses: params?.statuses?.join(','),
      },
    });
  },

  getPermitDetail: (id: string): Promise<WorkPermitDetail> => {
    return api.get(`/work-permits/${id}`);
  },

  createPermit: (data: CreateWorkPermitRequest): Promise<WorkPermit> => {
    return api.post('/work-permits', data);
  },

  submitPermit: (id: string, data: ApproveActionRequest): Promise<WorkPermit> => {
    return api.post(`/work-permits/${id}/submit`, data);
  },

  approvePermit: (id: string, data: ApproveActionRequest): Promise<WorkPermit> => {
    return api.post(`/work-permits/${id}/approve`, data);
  },

  rejectPermit: (id: string, data: ApproveActionRequest): Promise<WorkPermit> => {
    return api.post(`/work-permits/${id}/reject`, data);
  },

  recordGasDetection: (
    id: string,
    data: RecordGasDetectionRequest
  ): Promise<GasDetection> => {
    return api.post(`/work-permits/${id}/gas-detection`, data);
  },

  addIsolationPoint: (
    id: string,
    data: CreateIsolationPointRequest
  ): Promise<IsolationPoint> => {
    return api.post(`/work-permits/${id}/isolation-points`, data);
  },

  confirmIsolationPoint: (
    id: string,
    pointId: string,
    data: ApproveActionRequest
  ): Promise<IsolationPoint> => {
    return api.post(
      `/work-permits/${id}/isolation-points/${pointId}/confirm`,
      data
    );
  },

  startWork: (id: string, data: ApproveActionRequest): Promise<WorkPermit> => {
    return api.post(`/work-permits/${id}/start`, data);
  },

  recordEntry: (
    id: string,
    data: PersonnelOperationRequest
  ): Promise<PersonnelEntry> => {
    return api.post(`/work-permits/${id}/personnel/entry`, data);
  },

  recordExit: (
    id: string,
    data: PersonnelOperationRequest
  ): Promise<PersonnelEntry> => {
    return api.post(`/work-permits/${id}/personnel/exit`, data);
  },

  confirmResume: (
    id: string,
    data: ApproveActionRequest
  ): Promise<WorkPermit> => {
    return api.post(`/work-permits/${id}/confirm-resume`, data);
  },

  closePermit: (id: string, data: ApproveActionRequest): Promise<WorkPermit> => {
    return api.post(`/work-permits/${id}/close`, data);
  },

  cancelPermit: (id: string, data: ApproveActionRequest): Promise<WorkPermit> => {
    return api.post(`/work-permits/${id}/cancel`, data);
  },
};
