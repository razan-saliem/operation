# -*- coding: utf-8 -*-
from odoo import models, fields, api, _
from markupsafe import Markup


class CreateTaskWizard(models.TransientModel):
    _name = 'create.task.wizard'
    _description = 'Create Task from Helpdesk Ticket Wizard'

    ticket_id = fields.Many2one(
        'helpdesk.ticket',
        string='Helpdesk Ticket',
        required=True,
        default=lambda self: self.env.context.get('active_id')
    )
    project_id = fields.Many2one(
        'project.project',
        string='Project',
        required=True
    )
    name = fields.Char(
        string='Task Name',
        required=True
    )
    user_ids = fields.Many2one(
        'res.users',
        string='Assigned User',
        required=True
    )
    description = fields.Html(
        string='Description'
    )

    def action_create_task(self):
        """ Create the Project Task, log chatter notes, and create a To-Do activity. """
        self.ensure_one()

        # Update the ticket user if no user was originally assigned
        if not self.ticket_id.user_id or self.ticket_id.user_id != self.user_ids:
            self.ticket_id.write({
                'user_id': self.user_ids.id
            })

        # Create the project task
        task = self.env['project.task'].create({
            'name': f'Task from Helpdesk ticket {self.name}',
            'project_id': self.project_id.id,
            'user_ids': [(6, 0, [self.user_ids.id])],
            'description': self.description,
            'ticket_id': self.ticket_id.id,
        })

        # Post message on Helpdesk Ticket
        ticket_message = Markup(_("Project Task <b><a href='#' data-oe-model='project.task' data-oe-id='%s'>%s</a></b> has been created.") % (task.id, task.name))
        self.ticket_id.message_post(body=ticket_message, subtype_xmlid="mail.mt_note")

        # Post message on newly created Task
        task_message = Markup(_("This task was created from Helpdesk Ticket <b><a href='#' data-oe-model='helpdesk.ticket' data-oe-id='%s'>%s</a></b>.") % (self.ticket_id.id, self.ticket_id.name))
        task.message_post(body=task_message, subtype_xmlid="mail.mt_note")

        # Schedule a To-Do activity for the assigned user on the new task
        todo_activity_type = self.env.ref('mail.mail_activity_data_todo', raise_if_not_found=False)
        if todo_activity_type:
            task.activity_schedule(
                activity_type_id=todo_activity_type.id,
                summary=_('Follow up on task created from ticket: %s') % self.ticket_id.name,
                user_id=self.user_ids.id,
            )

        # Return action to open the newly created task
        return {
            'type': 'ir.actions.act_window',
            'res_model': 'project.task',
            'res_id': task.id,
            'view_mode': 'form',
            'target': 'current',
        }
