import pool from '../db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'your-secret-key';

class AuthController {
    async createUser(req, res) {
        try {
            const { name, surname, patronymic, email, password } = req.body;

            // Валидация
            if (!name || !surname || !email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Все обязательные поля должны быть заполнены'
                });
            }

            // Проверка существования пользователя
            const existingUser = await pool.query(
                'SELECT * FROM person WHERE email = $1',
                [email]
            );

            if (existingUser.rows.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Пользователь с таким email уже существует'
                });
            }

            // Хеширование пароля
            const hashedPassword = await bcrypt.hash(password, 10);

            // Создание пользователя
            const result = await pool.query(
                `INSERT INTO person (name, surname, patronymic, email, password, role) 
                 VALUES ($1, $2, $3, $4, $5, 'user') 
                 RETURNING id, name, surname, patronymic, email, role, status, created_at`,
                [name, surname, patronymic, email, hashedPassword]
            );

            const user = result.rows[0];

            res.status(201).json({
                success: true,
                message: 'Пользователь успешно зарегистрирован',
                data: user
            });

        } catch (error) {
            console.error('Ошибка регистрации:', error);
            res.status(500).json({
                success: false,
                message: 'Ошибка сервера при регистрации'
            });
        }
    }
    async loginUser(req, res) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Email и пароль обязательны'
                });
            }

            const result = await pool.query(
                'SELECT * FROM person WHERE email = $1',
                [email]
            );

            if (result.rows.length === 0) {
                return res.status(401).json({
                    success: false,
                    message: 'Неверный email или пароль'
                });
            }

            const user = result.rows[0];

            if (user.status !== 'active') {
                return res.status(403).json({
                    success: false,
                    message: 'Аккаунт заблокирован'
                });
            }

            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({
                    success: false,
                    message: 'Неверный email или пароль'
                });
            }

            const token = jwt.sign(
                {
                    userId: user.id,
                    email: user.email,
                    role: user.role
                },
                JWT_SECRET,
                { expiresIn: '24h' }
            );

            const { password: _, ...userWithoutPassword } = user;

            res.json({
                success: true,
                message: 'Авторизация успешна',
                data: {
                    user: userWithoutPassword,
                    token
                }
            });

        } catch (error) {
            console.error('Ошибка авторизации:', error);
            res.status(500).json({
                success: false,
                message: 'Ошибка сервера при авторизации'
            });
        }
    }
}

export default new AuthController()