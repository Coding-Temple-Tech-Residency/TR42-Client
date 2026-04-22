const LOGIN_ENDPOINT = '/api/users/login';
const REGISTER_ENDPOINT = '/api/users/register';
const VERIFY_EMAIL_ENDPOINT = '/api/users/verify-email';
const REGISTER_CLIENT_ENDPOINT = '/api/clients/register';

export const authService = {
    login: async ({ email, password }) => {
        try {
            const response = await fetch(LOGIN_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            let payload = {};
            try {
                payload = await response.json();
            } catch (e) {
                // If response is not JSON, leave payload as {}
            }

            if (!response.ok) {
                throw new Error(payload?.message || 'Invalid email or password.');
            }

            return payload;

        } catch (err) {
            if (err instanceof TypeError) {
                throw new Error('Unable to reach server. Please try again later.');
            }
            throw err;
        }
    },

    register: async (formData) => {
        try {
            const address = {
                street: formData.street || "",
                city: formData.city || "",
                state: formData.state || "",
                zip: formData.zip || "",
                country: formData.country || ""
            };

            const payload = {};
            Object.entries(formData).forEach(([key, value]) => {
                if (
                    value !== null &&
                    value !== undefined &&
                    key !== 'confirmPassword' &&
                    key !== 'street' &&
                    key !== 'city' &&
                    key !== 'state' &&
                    key !== 'zip' &&
                    key !== 'country'
                ) {
                    payload[key] = value;
                }
            });
            payload.address = address;
            const response = await fetch(REGISTER_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });
            let respPayload = {};
            try {
                respPayload = await response.json();
            } catch (e) {}
            if (!response.ok) {
                throw new Error(respPayload?.message || 'Registration failed');
            }
            return respPayload;
        } catch (err) {
            if (err instanceof TypeError) {
                throw new Error('Unable to reach server. Please try again later.');
            }
            throw err;
        }
    },

    registerClient: async (formData) => {
        try {
            const address = {
                street: formData.street || "",
                city: formData.city || "",
                state: formData.state || "",
                zip: formData.zip || "",
                country: formData.country || "",
            };

            const payload = {
                client_name: formData.client_name,
                client_code: formData.client_code,
                primary_contact_name: formData.primary_contact_name,
                company_email: formData.company_email,
                company_contact_number: formData.company_contact_number,
                address,
            };

            if (formData.company_web_address) {
                payload.company_web_address = formData.company_web_address;
            }

            const response = await fetch(REGISTER_CLIENT_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const respPayload = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(respPayload?.message || 'Registration failed');
            }

            return respPayload;
        } catch (err) {
            if (err instanceof TypeError) {
                throw new Error('Unable to reach server. Please try again later.');
            }
            throw err;
        }
    },

    verifyEmail: async (token) => {
        try {
            const response = await fetch(`${VERIFY_EMAIL_ENDPOINT}?token=${token}`);
            const payload = await response.json().catch(() => ({}));
            if (!response.ok) {
                return { success: false, message: payload?.message || 'Verification failed.' };
            }
            return { success: true, message: payload.message };
        } catch (err) {
            if (err instanceof Error) {
                return { success: false, message: err.message };
            }
            return { success: false, message: 'Unable to reach server. Please try again later.' };
        }
    },
};
