from django import template
from django.utils.safestring import mark_safe
from django.utils.html import escape

register = template.Library()

try:
    import markdown as _markdown
    _HAS_MARKDOWN = True
except Exception:
    _markdown = None
    _HAS_MARKDOWN = False


@register.filter(name='markdown')
def markdown_filter(value):
    """Convert Markdown to HTML if python-markdown is available.

    If the `markdown` package is not installed, fall back to escaped
    preformatted text so the template system doesn't crash.
    """
    if not value:
        return ''

    if _HAS_MARKDOWN:
        html = _markdown.markdown(value, extensions=['fenced_code', 'tables', 'codehilite'])
        return mark_safe(html)

    # Fallback: return escaped preformatted text
    return mark_safe('<pre class="md-fallback">{}</pre>'.format(escape(value)))
