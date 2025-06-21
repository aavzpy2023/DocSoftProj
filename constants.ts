
import { FileNode } from './types';

export const APP_TITLE = "DocuHub";

export const INITIAL_FILE_STRUCTURE: FileNode[] = [
  {
    id: 'proj-alpha',
    name: 'Project Alpha',
    type: 'folder',
    path: 'Project Alpha',
    isOpen: true,
    children: [
      { 
        id: 'proj-alpha-readme', 
        name: 'README.md', 
        type: 'file', 
        path: 'Project Alpha/README.md',
        content: '# Project Alpha\n\nThis is the main readme for Project Alpha. It contains an overview of the project and how to get started.\n\n## Sub-heading\n\n- Bullet point 1\n- Bullet point 2\n\n```javascript\nconsole.log("Hello, Alpha!");\n```'
      },
      { 
        id: 'proj-alpha-user-guide', 
        name: 'user_guide.md', 
        type: 'file', 
        path: 'Project Alpha/user_guide.md',
        content: '# User Guide\n\nDetailed instructions on how to use Project Alpha.\n\n### Feature 1\n\nDescription of Feature 1.'
      },
      {
        id: 'proj-alpha-api',
        name: 'API Docs',
        type: 'folder',
        path: 'Project Alpha/API Docs',
        isOpen: false,
        children: [
          { 
            id: 'proj-alpha-api-endpoints', 
            name: 'endpoints.md', 
            type: 'file', 
            path: 'Project Alpha/API Docs/endpoints.md',
            content: '## Endpoints\n\n- `GET /api/users` - Retrieves all users.\n- `POST /api/users` - Creates a new user.'
          },
        ],
      },
    ],
  },
  {
    id: 'bi-versat',
    name: 'Bi-Versat',
    type: 'folder',
    path: 'Bi-Versat',
    isOpen: false,
    children: [
        { 
          id: 'bi-versat-manual', 
          name: 'manual de usuario.md', 
          type: 'file', 
          path: 'Bi-Versat/manual de usuario.md',
          content: '# Manual de Usuario Bi-Versat\n\nContenido del manual de usuario para el sistema Bi-Versat.\n\n## Instalación\n\nPasos para instalar Bi-Versat...' 
        }
    ]
  },
  { 
    id: 'orphaned-file', 
    name: 'standalone_doc.md', 
    type: 'file', 
    path: 'standalone_doc.md',
    content: '# Standalone Document\n\nThis document is not part of any project folder.'
  }
];
