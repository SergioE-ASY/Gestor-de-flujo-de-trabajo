from django.db import migrations, models


def split_themes(apps, schema_editor):
    User = apps.get_model('accounts', 'User')
    for user in User.objects.all():
        if user.color_theme in ('dark', 'light'):
            user.base_theme = user.color_theme
            user.color_theme = 'default'
        else:
            user.base_theme = 'dark'
        user.save(update_fields=['base_theme', 'color_theme'])


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0002_user_premium_theme'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='base_theme',
            field=models.CharField(
                choices=[('dark', 'Oscuro'), ('light', 'Claro')],
                default='dark',
                max_length=10,
            ),
        ),
        migrations.AlterField(
            model_name='user',
            name='color_theme',
            field=models.CharField(
                choices=[
                    ('default', 'Por defecto'),
                    ('pink', 'Rosa'),
                    ('red', 'Rojo'),
                    ('blue', 'Azul'),
                    ('green', 'Verde'),
                ],
                default='default',
                max_length=20,
            ),
        ),
        migrations.RunPython(split_themes, migrations.RunPython.noop),
    ]
