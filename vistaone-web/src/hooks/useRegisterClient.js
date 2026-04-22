import { useState } from "react";
import { authService } from "../services/authServices";

export function useRegisterClient() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const submitClientRegistration = async (formData) => {
        setLoading(true);
        setError(null);
        setSuccess(false);
        try {
            await authService.registerClient(formData);
            setSuccess(true);
        } catch (err) {
            setError(err.message || "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    return { submitClientRegistration, loading, error, success };
}
