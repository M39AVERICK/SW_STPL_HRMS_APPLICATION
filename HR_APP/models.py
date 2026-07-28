from django.db import models, transaction
from ACCOUNTS.models import CURRENT_USER


# ==========================================
# Department Master``
# ==========================================
class Department(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name


# ==========================================
# Employee Master
# ==========================================
class Employee(models.Model):

    GENDER_CHOICES = [
        ('Male', 'Male'),
        ('Female', 'Female'),
        ('Other', 'Other'),
    ]

    EMPLOYMENT_TYPES = [
        ('Full Time', 'Full Time'),
        ('Intern', 'Intern'),
        ('Contract', 'Contract'),
        ('Part Time', 'Part Time'),
    ]
    MARITAL_STATUS = [
    ("Single","Single"),
    ("Married","Married"),
    ("Divorced","Divorced"),
    ("Widowed","Widowed"),
]

    BLOOD_GROUPS = [
    ("A+","A+"),
    ("A-","A-"),
    ("B+","B+"),
    ("B-","B-"),
    ("AB+","AB+"),
    ("AB-","AB-"),
    ("O+","O+"),
    ("O-","O-"),
]
    # User Login Mapping
    user = models.ForeignKey(
        CURRENT_USER,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    # Auto-generated Employee ID
    employee_id = models.CharField(
        max_length=20,
        unique=True,
        editable=False
    )

    # Personal Information
    first_name = models.CharField(max_length=50)
    middle_name = models.CharField(max_length=50, blank=True, null=True)
    last_name = models.CharField(max_length=50)

    gender = models.CharField(
        max_length=10,
        choices=GENDER_CHOICES,
        blank=True,
        null=True
    )

    date_of_birth = models.DateField(
        blank=True,
        null=True
    )

    phone_number = models.CharField(max_length=15)

    official_email = models.EmailField(unique=True)
    personal_email = models.EmailField(blank=True, null=True)

    profile_picture = models.ImageField(
        upload_to='employee_photos/',
        blank=True,
        null=True    
    )
    marital_status = models.CharField(
            max_length=20,
            blank=True,
            choices=MARITAL_STATUS,
            null=True
        )

    blood_group = models.CharField(
            max_length=10,
            choices=BLOOD_GROUPS,
            blank=True,
            null=True
        )

    nationality = models.CharField(
            max_length=50,
            default="Indian"
        )

    father_name = models.CharField(
            max_length=100,
            blank=True,
            null=True
        )

    mother_name = models.CharField(
            max_length=100,
            blank=True,
            null=True
        )

    # Professional Information
    position = models.CharField(max_length=100)
    employee_type = models.CharField(
    max_length=30,
    blank=True,
    null=True
)

    reporting_manager = models.ForeignKey(
    "self",
    on_delete=models.SET_NULL,
    null=True,
    blank=True,
    related_name="team_members"
)

    work_location = models.CharField(
            max_length=100,
            blank=True,
            null=True
        )

    department = models.ForeignKey(
                Department,
                on_delete=models.SET_NULL,
                null=True,
                related_name='employees'
            )

    employment_type = models.CharField(
        max_length=20,
        choices=EMPLOYMENT_TYPES,
        default='Full Time'
    )

    joining_date = models.DateField()

    

    salary = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    # Identity Information
    pan = models.CharField(max_length=20, unique=True)
    aadhaar = models.CharField(max_length=20, unique=True)
    uan = models.CharField(max_length=20, blank=True, null=True)
    pf_number = models.CharField(max_length=20, blank=True, null=True)

    # Status
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):

        if not self.employee_id:
            with transaction.atomic():

                last_emp = (
                    Employee.objects
                    .select_for_update()
                    .order_by('-employee_id')
                    .first()
                )

                if last_emp:
                    try:
                        last_seq = int(
                            last_emp.employee_id.split('-')[-1]
                        )
                    except (ValueError, IndexError):
                        last_seq = 5000

                    new_seq = last_seq + 1
                else:
                    new_seq = 5001

                self.employee_id = f"STPL-{str(new_seq).zfill(5)}"

        super().save(*args, **kwargs)

    @property
    def full_name(self):
     return " ".join(
        filter(
            None,
            [self.first_name, self.middle_name, self.last_name]
        )
    )

    def __str__(self):
        return f"{self.employee_id} - {self.full_name}"


# ==========================================
# Bank Details
# ==========================================
class BankDetail(models.Model):
    employee = models.OneToOneField(
        Employee,
        on_delete=models.CASCADE,
        related_name='bank'
    )

    bank_name = models.CharField(max_length=100)
    account_number = models.CharField(max_length=50)
    ifsc_code = models.CharField(max_length=20)
    branch_name = models.CharField(
    max_length=100,
    blank=True,
    null=True   
    )
    account_type = models.CharField(
    max_length=20,
    blank=True,
    null=True
)

    account_holder_name = models.CharField(
    max_length=100,
    blank=True,
    null=True
    )

    def __str__(self):
        return f"{self.employee.full_name} Bank Details"


# ==========================================
# Additional Employee Information
# ==========================================
class EmployeeExtra(models.Model):
    employee = models.OneToOneField(
        Employee,
        on_delete=models.CASCADE,
        related_name='extra'
    )

    # Address
    current_address = models.TextField(blank=True, null=True)
    permanent_address = models.TextField(blank=True, null=True)

    city = models.CharField(max_length=100, blank=True, null=True)
    state = models.CharField(max_length=100, blank=True, null=True)
    country = models.CharField(max_length=100, default="India")
    postal_code = models.CharField(max_length=10, blank=True, null=True)

    # Emergency Contact
    emergency_contact_name = models.CharField(
        max_length=100,
        blank=True,
        null=True
    )

    emergency_contact_number = models.CharField(
        max_length=15,
        blank=True,
        null=True
    )

    emergency_contact_relation = models.CharField(
        max_length=50,
        blank=True,
        null=True
    )
    skills = models.TextField(blank=True, null=True)
    experience_years = models.DecimalField(
    max_digits=4,
    decimal_places=1,
    blank=True,
    null=True
)
    # Company Assets
    asset_id = models.CharField(
        max_length=50,
        blank=True,
        null=True
    )

    laptop_number = models.CharField(
        max_length=50,
        blank=True,
        null=True
    )

    remarks = models.TextField(
        blank=True,
        null=True
    )


    def __str__(self):
        return f"{self.employee.employee_id} - Extra Details"
# ==========================================
# Employee Documents
# ==========================================
def employee_document_path(instance, filename):
    emp_id = instance.employee.employee_id
    return f'employees/{emp_id}/{filename}'


class EmployeeDocument(models.Model):
    employee = models.OneToOneField(
        Employee,
        on_delete=models.CASCADE,
        related_name='documents'
    )

    pan_document = models.FileField(
        upload_to=employee_document_path,
        blank=True,
        null=True
    )

    aadhaar_document = models.FileField(
        upload_to=employee_document_path,
        blank=True,
        null=True
    )

    resume = models.FileField(
        upload_to=employee_document_path,
        blank=True,
        null=True
    )

    offer_letter = models.FileField(
        upload_to=employee_document_path,
        blank=True,
        null=True
    )

    experience_certificate = models.FileField(
        upload_to=employee_document_path,
        blank=True,
        null=True
    )

    other_document = models.FileField(
        upload_to=employee_document_path,
        blank=True,
        null=True
    )
    def __str__(self):
        return f"{self.employee.full_name} Documents"