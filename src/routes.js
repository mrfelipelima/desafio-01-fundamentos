import { randomUUID } from 'node:crypto'
import { Database } from './database.js'
import { buildRoutePath } from './utils/build-route-path.js'

const database = new Database()

export const routes = [
  {
    // Criação de uma task
    path: buildRoutePath('/tasks'),
    method: 'POST',
    handler: (req, res) => {
      // Valida se o corpo da requisição não está vazio
      if (req.body === null) {
        return res
          .writeHead(400, null, {
            'Content-type': 'application/json'
          })
          .end(JSON.stringify({
            error: 'Provide creation data: title and description'
          }))
      }

      const { title, description } = req.body

      // Valida se o title e o description estão presentes no corpo da requisição
      // ou se não falta nenhum destes
      if (!title || !description) {
        return res
          .writeHead(400, null, {
            'Content-type': 'application/json'
          })
          .end(JSON.stringify({
            error: 'There is not title or description, please provide these data'
          }))
      }

      const task = {
        id: randomUUID(),
        title,
        description,
        completed_at: null,
        created_at: new Date().toISOString(),
        updated_at: null,
      }

      database.insert('tasks', task)
      
      return res.writeHead(201).end()
    }
  },
  {
    // Obter tasks & busca
    path: buildRoutePath('/tasks'),
    method: 'GET',
    handler: (req, res) => {
      const { search } = req.query
      const tasks = database.select('tasks', search ? {
        title: search,
        description: search
      } : null)
      return res.setHeader('Content-type', 'application/json').end(JSON.stringify(tasks))
    }
  },
  {
    // Atualizar uma task pelo id
    path: buildRoutePath('/tasks/:id'),
    method: 'PUT',
    handler: (req, res) => {
      const { id } = req.params

      if (req.body === null) {
        return res
          .writeHead(400, null, {
            'Content-type': 'application/json'
          })
          .end(JSON.stringify({
            error: 'Provide update data: title or description'
          }))
      }

      const { title, description } = req.body

      if (title && description) {
        return res
          .writeHead(400, null, {
            'Content-type': 'application/json'
          })
          .end(JSON.stringify({
            error: 'Impossible to update two properties at same time.'
          }))
      }

      const task = database.select('tasks', { id })

      if (task.length <= 0) {
        return res.setHeader('status', 404).end()
      }

      if (title) {
        database.update('tasks', id, {
          ...task[0],
          title,
          updated_at: new Date().toISOString(),
        })
      }

      if (description) {
        database.update('tasks', id, {
          ...task[0],
          description,
          updated_at: new Date().toISOString(),
        })
      }

      return res.writeHead(204).end()
    }
  },
  {
    // Deletar uma task pelo ID
    path: buildRoutePath('/tasks/:id'),
    method: 'DELETE',
    handler: (req, res) => {
      const { id } = req.params

      const task = database.select('tasks', { id })

      if (task.length <= 0) {
        return res.writeHead(404).end()
      }

      database.delete('tasks', id)

      return res.writeHead(204).end()
    }
  },
  {
    // Atualizar o status da task pelo ID
    path: buildRoutePath('/tasks/:id/complete'),
    method: 'PATCH',
    handler: (req, res) => {
      const { id } = req.params

      const task = database.select('tasks', { id })

      if (task.length <= 0) {
        return res.writeHead(404).end()
      }

      if (!task[0].completed_at) {
        database.update('tasks', id, {
          ...task[0],
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        return res.writeHead(204).end()
      }

      if (task[0].completed_at) {
        database.update('tasks', id, {
          ...task[0],
          completed_at: null,
          updated_at: new Date().toISOString(),
        })
        return res.writeHead(204).end()
      }
    }
  }
]