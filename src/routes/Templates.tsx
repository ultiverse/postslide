import { getAllTemplates } from '@/templates';
import { useProject } from '@/state/project.store';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button/Button';
import { Card } from '@/components/ui/Card';

export default function Templates() {
  const templates = getAllTemplates();
  const applyTemplateToAllSlides = useProject((s) => s.applyTemplateToAllSlides);
  const project = useProject((s) => s.project);
  const navigate = useNavigate();

  const handleApplyTemplate = (templateId: string) => {
    applyTemplateToAllSlides(templateId);
    navigate('/editor');
  };

  const defaultBrand = project.brand || {
    primary: '#4a67ff',
    fontHead: 'Inter',
    fontBody: 'Inter',
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="container py-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Template Gallery</h1>
          <p className="text-neutral-600">
            Choose a template to apply to all slides in your project
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <Card key={template.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="mb-4">
                <h3 className="text-xl font-bold mb-2">{template.name}</h3>
                {template.description && (
                  <p className="text-sm text-neutral-600 mb-4">
                    {template.description}
                  </p>
                )}
                {template.coverStyle && (
                  <span className="inline-block px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-700 rounded">
                    {template.coverStyle}
                  </span>
                )}
              </div>

              {/* Preview */}
              <div className="mb-4 bg-neutral-100 rounded-lg overflow-hidden" style={{ height: '240px' }}>
                <div style={{ transform: 'scale(0.22)', transformOrigin: 'top left', width: '1080px', height: '1080px' }}>
                  {template.layout(
                    {
                      id: 'preview',
                      templateId: template.id,
                      blocks: template.defaults.blocks || [],
                    },
                    defaultBrand
                  )}
                </div>
              </div>

              <Button
                onClick={() => handleApplyTemplate(template.id)}
                className="w-full"
              >
                Apply to Project
              </Button>
            </Card>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Button variant="outline" onClick={() => navigate('/editor')}>
            Back to Editor
          </Button>
        </div>
      </div>
    </div>
  );
}
