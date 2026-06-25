import { apiClient } from "./apiClient"; // CHANGED: was direct `axios` import + BASE_URL

export type DropdownItem = { id: number; name: string };

export type EmployeeFormOptions = {
    genders: DropdownItem[];
    communities: DropdownItem[];
    designations: DropdownItem[];
    departments: DropdownItem[];
    locations: DropdownItem[];
    shifts: DropdownItem[];
    roles: DropdownItem[];
};

export type Employee = {
    employeeId: number;
    employeeCode: string;
    employeeName: string;
    genderId: number;
    genderName: string;
    communityId: number | null;
    communityName: string | null;
    designationId: number;
    designationName: string;
    departmentId: number;
    departmentName: string;
    locationId: number;
    locationName: string;
    shiftId: number;
    shiftName: string;
    mobileNo: string | null;
    email: string | null;
    address: string | null;
    joiningDate: string | null;
    isActive: boolean;
};

export type EmployeeCreatePayload = {
    employeeCode: string;
    employeeName: string;
    genderId: number;
    communityId: number | null;
    designationId: number;
    departmentId: number;
    locationId: number;
    shiftId: number;
    mobileNo: string;
    email: string;
    address: string;
    joiningDate: string | null;
    username: string;
    password: string;
    roleId: number;
};

// Code, Name, Gender are locked — cannot be updated after creation
export type EmployeeUpdatePayload = {
    communityId: number | null;
    designationId: number;
    departmentId: number;
    locationId: number;
    shiftId: number;
    mobileNo: string;
    email: string;
    address: string;
    joiningDate: string | null;
    isActive: boolean;
};

export const getFormOptions = async (): Promise<EmployeeFormOptions> => {
    const response = await apiClient.get(`/employee/form-options`); // CHANGED: was axios.get(`${BASE_URL}/...`)
    return response.data;
};

export const getEmployees = async (): Promise<Employee[]> => {
    const response = await apiClient.get(`/employee`); // CHANGED: was axios.get(`${BASE_URL}/...`)
    return response.data;
};

export const searchEmployees = async (keyword: string): Promise<Employee[]> => {
    const response = await apiClient.get(`/employee/search`, { // CHANGED: was axios.get(`${BASE_URL}/...`)
        params: { keyword },
    });
    return response.data;
};

export const createEmployee = async (payload: EmployeeCreatePayload) => {
    const response = await apiClient.post(`/employee`, payload); // CHANGED: was axios.post(`${BASE_URL}/...`)
    return response.data;
};

export const updateEmployee = async (
    employeeId: number,
    payload: EmployeeUpdatePayload
) => {
    const response = await apiClient.put( // CHANGED: was axios.put(`${BASE_URL}/...`)
        `/employee/${employeeId}`,
        payload
    );
    return response.data;
};