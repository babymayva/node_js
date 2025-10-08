import pool from '../db.js'

class UserController {

    async getUser(req, res) {
        try {
            const result = await pool.query(
                `SELECT id,
                        name,
                        surname,
                        patronymic,
                        email,
                        role,
                        status,
                        created_at
                 FROM person
                 ORDER BY created_at DESC`
            );

            res.json({
                success: true,
                data: result.rows
            });

        } catch (error) {
            console.error('Ошибка получения списка пользователей:', error);
            res.status(500).json({
                success: false,
                message: 'Ошибка сервера'
            });
        }
    }

    async getOneUser(req, res) {
        try {
            const {id} = req.params;
            if (req.user.role !== 'admin' && req.user.userId !== parseInt(id)) {
                return res.status(403).json({
                    success: false,
                    message: 'Недостаточно прав для просмотра этого профиля'
                });
            }

            const result = await pool.query(
                `SELECT id,
                        name,
                        surname,
                        patronymic,
                        email,
                        role,
                        status,
                        created_at
                 FROM person
                 WHERE id = $1`,
                [id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Пользователь не найден'
                });
            }

            res.json({
                success: true,
                data: result.rows[0]
            });

        } catch (error) {
            console.error('Ошибка получения пользователя:', error);
            res.status(500).json({
                success: false,
                message: 'Ошибка сервера'
            });
        }
    }

    async blockUser(req, res) {
        try {
            const {id} = req.params;

            if (req.user.role !== 'admin' && req.user.userId !== parseInt(id)) {
                return res.status(403).json({
                    success: false,
                    message: 'Недостаточно прав для блокировки этого пользователя'
                });
            }

            const result = await pool.query(
                `UPDATE person
                 SET status = 'inactive'
                 WHERE id = $1 RETURNING id, name, surname, patronymic, email, role, status`,
                [id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Пользователь не найден'
                });
            }

            res.json({
                success: true,
                message: 'Пользователь заблокирован',
                data: result.rows[0]
            });

        } catch (error) {
            console.error('Ошибка блокировки пользователя:', error);
            res.status(500).json({
                success: false,
                message: 'Ошибка сервера'
            });
        }
    }

    async activateUser(req, res) {
        try {
            const {id} = req.params;

            const result = await pool.query(
                `UPDATE person
                 SET status = 'active'
                 WHERE id = $1 RETURNING id, name, surname, patronymic, email, role, status`,
                [id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Пользователь не найден'
                });
            }

            res.json({
                success: true,
                message: 'Пользователь активирован',
                data: result.rows[0]
            });

        } catch (error) {
            console.error('Ошибка активации пользователя:', error);
            res.status(500).json({
                success: false,
                message: 'Ошибка сервера'
            });
        }

    }
}
export default new UserController()