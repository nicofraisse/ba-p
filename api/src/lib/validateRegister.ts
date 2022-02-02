import { UsernamePasswordInput } from './../resolvers/UsernamePasswordInput'

export const validateRegister = (options: UsernamePasswordInput) => {
  if (!options.email.includes('@')) {
    return [
      {
        field: 'email',
        message: "cette address courriel n'est pas valide",
      },
    ]
  }
  if (options.username.length <= 2) {
    return [
      {
        field: 'username',
        message: "le nom d'utilisatuer doit contenir au moins deux cararctères",
      },
    ]
  }
  if (options.username.includes('@')) {
    return [
      {
        field: 'username',
        message: "le nom d'utilisatuer ne peut pas contenir le caractère '@'",
      },
    ]
  }
  if (options.password.length < 6) {
    return [
      {
        field: 'password',
        message: 'le mot de passe doit contenir au moins six cararctères',
      },
    ]
  }
  return null
}
