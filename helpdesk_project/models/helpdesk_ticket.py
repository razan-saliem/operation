# -*- coding: utf-8 -*-
from odoo import models, fields, api, _


class HelpdeskTicket(models.Model):
    _inherit = 'helpdesk.ticket'

    task_ids = fields.One2many(
        'project.task',
        'ticket_id',
        string='Linked Tasks'
    )
    task_count = fields.Integer(
        string='Task Count',
        compute='_compute_task_count'
    )

    @api.depends('task_ids')
    def _compute_task_count(self):
        for ticket in self:
            ticket.task_count = len(ticket.task_ids)

    def action_open_create_task_wizard(self):
        """ Opens the transient wizard to create a project task from this ticket. """
        self.ensure_one()
        return {
            'name': _('Create Project Task'),
            'type': 'ir.actions.act_window',
            'res_model': 'create.task.wizard',
            'view_mode': 'form',
            'target': 'new',
            'context': {
                'default_ticket_id': self.id,
                'default_name': self.name,
                'default_description': self.description,
                'default_user_ids': self.user_id.id if self.user_id else False,
            }
        }

    def action_view_tasks(self):
        """ Opens a view of all project tasks linked to this ticket. """
        self.ensure_one()
        action = self.env["ir.actions.actions"]._for_xml_id("project.action_view_task")

        if self.task_count == 1:
            action['views'] = [(False, 'form')]
            action['res_id'] = self.task_ids.id
        else:
            action['views'] = [(False, 'list'), (False, 'form')]
            action['domain'] = [('ticket_id', '=', self.id)]

        action['context'] = {'default_ticket_id': self.id}
        return action


class ProjectTask(models.Model):
    _inherit = 'project.task'

    ticket_id = fields.Many2one(
        'helpdesk.ticket',
        string='Source Ticket',
        ondelete='set null'
    )