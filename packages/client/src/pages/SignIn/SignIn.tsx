import { Button, Form, Input, Flex, Card } from 'antd'
import { loginValidationSchema } from '../../utils/ruleSchemes'
import { Link, useNavigate } from 'react-router-dom'

import useSignIn from './hooks/useSignIn'
import { routes } from 'config/routes'

const tailFormItemLayout = {
  wrapperCol: {
    xs: {
      span: 24,
      offset: 0,
    },
    sm: {
      span: 16,
      offset: 4,
    },
  },
}

export const SignIn: React.FC = () => {
  const [form] = Form.useForm()
  const navigate = useNavigate()

  const { login, yandexOAuthUrl } = useSignIn()

  const navigateToSiguUp = (): void => {
    navigate(routes.signup())
  }

  return (
    <Flex
      style={{ minHeight: '700px' }}
      gap="middle"
      align="center"
      justify="center"
      vertical>
      <Card
        title="Авторизация"
        size="small"
        styles={{ header: { textAlign: 'center' } }}
        style={{ width: 410 }}>
        <Form form={form} name="login" onFinish={login} layout="vertical">
          <Form.Item
            name="login"
            label="Логин"
            rules={loginValidationSchema.login}>
            <Input />
          </Form.Item>

          <Form.Item
            name="password"
            label="Пароль"
            rules={loginValidationSchema.password}>
            <Input.Password />
          </Form.Item>

          <Form.Item {...tailFormItemLayout}>
            <Button type="primary" htmlType="submit" block>
              Войти
            </Button>
          </Form.Item>
          <Form.Item {...tailFormItemLayout}>
            <Link to={yandexOAuthUrl}>Войти с помощью yandex</Link>
          </Form.Item>
          <Form.Item {...tailFormItemLayout}>
            <Button
              type="link"
              htmlType="submit"
              block
              onClick={navigateToSiguUp}>
              Нет аккаунта?
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </Flex>
  )
}
