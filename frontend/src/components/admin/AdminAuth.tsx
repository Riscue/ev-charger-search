import React, {useState} from 'react';
import {
    Box,
    Button,
    Card,
    CardContent,
    Container,
    TextField,
    Typography,
    Alert,
    CircularProgress
} from "@mui/material";
import {useNavigate} from "react-router-dom";

interface AdminAuthProps {
    onAuthSuccess: (username: string, password: string) => void;
}

export default function AdminAuth({onAuthSuccess}: AdminAuthProps) {
    const navigate = useNavigate();
    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [loginError, setLoginError] = useState<string>("");

    const handleLogin = async () => {
        if (!username.trim() || !password.trim()) {
            setLoginError("Kullanıcı adı ve şifre gerekli");
            return;
        }

        setIsLoading(true);
        setLoginError("");

        try {
            // Verify authentication
            const response = await fetch('/api/admin/auth', {
                headers: {
                    'Authorization': `Basic ${btoa(`${username.trim()}:${password.trim()}`)}`
                }
            });

            if (!response.ok) {
                throw new Error('Authentication failed');
            }

            const result = await response.json();
            if (result.success) {
                onAuthSuccess(username.trim(), password.trim());
            } else {
                setLoginError("Giriş başarısız. Bilgilerinizi kontrol edin.");
            }
        } catch (error: any) {
            setLoginError("Giriş başarısız. Bilgilerinizi kontrol edin.");
            console.error("Login error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter') {
            handleLogin();
        }
    };

    return (
        <Container component="main" maxWidth="sm">
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Card sx={{width: '100%', maxWidth: 400}}>
                    <CardContent sx={{p: 4}}>
                        <Typography component="h1" variant="h4" align="center" gutterBottom>
                            Admin Panel
                        </Typography>
                        <Typography variant="body2" align="center" color="text.secondary" sx={{mb: 3}}>
                            Lütfen giriş yapın
                        </Typography>

                        {loginError && (
                            <Alert severity="error" sx={{mb: 2}}>
                                {loginError}
                            </Alert>
                        )}

                        <Box component="form" sx={{mt: 1}}>
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="username"
                                label="Kullanıcı Adı"
                                name="username"
                                autoComplete="username"
                                autoFocus
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                onKeyPress={handleKeyPress}
                                disabled={isLoading}
                            />
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                name="password"
                                label="Şifre"
                                type="password"
                                id="password"
                                autoComplete="current-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onKeyPress={handleKeyPress}
                                disabled={isLoading}
                            />
                            <Button
                                type="button"
                                fullWidth
                                variant="contained"
                                sx={{mt: 3, mb: 2}}
                                onClick={handleLogin}
                                disabled={isLoading}
                                startIcon={isLoading ? <CircularProgress size={20} /> : null}
                            >
                                {isLoading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
                            </Button>
                            <Button
                                type="button"
                                fullWidth
                                variant="outlined"
                                onClick={() => navigate('/')}
                                disabled={isLoading}
                            >
                                Ana Sayfaya Dön
                            </Button>
                        </Box>
                    </CardContent>
                </Card>
            </Box>
        </Container>
    );
}