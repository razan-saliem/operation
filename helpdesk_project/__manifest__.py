{
    'name': 'Helpdesk Project Integration',
    'version': '18.0.1.0.0',
    'category': 'Services/Helpdesk',
    'summary': 'Create and manage Project Tasks directly from Helpdesk Tickets',
    'description': """
============================
Helpdesk Project Integration
============================

This module integrates Odoo Helpdesk with the Project application, allowing to generate Project Tasks directly from Helpdesk Tickets.

Features:
---------
* Wizard dialog to quickly generate tasks pre-populated with ticket data.
* Auto-syncs ticket assignees if a new user is selected in the wizard.
* Smart button on ticket form showing linked task counts.
* Automatic chatter notes and scheduled To-Do activities upon task creation.

Usage
-----
1. Open any Helpdesk Ticket form.
2. Click the **Create Task** button in the top header.
3. Select the target **Project**, review or modify the task details and assigned user, then click **Create Task**.
4. Access linked tasks at any time using the **Tasks** smart button on the ticket form.

Changelog:
----------
* **v18.0.1.0.0** (2026-09-10): Initial release with helpdesk task creation wizard, chatter notifications, and smart buttons.
    """,
    'author': 'Eng.Razan Salim',
    'support': "razan.saliem98@gmail.com",
    'license': 'LGPL-3',
    'depends': [
        'base',
        'mail',
        'moad_helpdesk',
        'project',
    ],
    'data': [
        'security/ir.model.access.csv',
        'wizards/create_task_wizard_views.xml',
        'views/helpdesk_ticket_views.xml',
    ],
    'installable': True,
    'application': False,
    'auto_install': False
}