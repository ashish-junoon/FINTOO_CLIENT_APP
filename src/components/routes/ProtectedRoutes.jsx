import React from 'react'
import { useAuth } from '../context/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';

function ProtectedRoutes() {
    const { loggedUser } = useAuth();
    const isLoggedIn = loggedUser?.status;
    return isLoggedIn ? <Outlet /> : <Navigate to="/login" />
}

export default ProtectedRoutes