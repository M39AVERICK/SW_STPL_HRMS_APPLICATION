from django.db import models

class Resume(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=15, blank=True, null=True)
    file = models.FileField(upload_to='resumes/')
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, default='uploaded')

    def __str__(self):
        return self.name