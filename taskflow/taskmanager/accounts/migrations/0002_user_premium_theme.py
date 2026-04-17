from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='is_premium',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='user',
            name='color_theme',
            field=models.CharField(
                choices=[
                    ('dark', 'Oscuro'),
                    ('light', 'Claro'),
                    ('pink', 'Rosa'),
                    ('red', 'Rojo'),
                    ('blue', 'Azul'),
                    ('green', 'Verde'),
                ],
                default='dark',
                max_length=20,
            ),
        ),
    ]
