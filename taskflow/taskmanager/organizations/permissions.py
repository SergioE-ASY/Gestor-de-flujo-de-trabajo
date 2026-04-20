from .models import OrganizationUser


def get_org_membership(org, user):
    return OrganizationUser.objects.filter(organization=org, user=user).first()


def can_manage_members(membership) -> bool:
    """Owner and admin can invite, remove and change roles."""
    return membership is not None and membership.role in ('owner', 'admin')


def can_delete_org(membership) -> bool:
    return membership is not None and membership.role == 'owner'


def can_view_org(membership) -> bool:
    return membership is not None
