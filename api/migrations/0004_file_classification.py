# Generated by Django 5.0.4 on 2024-05-01 06:33

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0003_remove_check_user_remove_contract_user_file_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='file',
            name='classification',
            field=models.CharField(default='', max_length=255),
        ),
    ]
