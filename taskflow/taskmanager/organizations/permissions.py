from .models import OrganizationUser


def get_org_membership(org, user):
    return OrganizationUser.objects.filter(organization=org, user=user).first()


def can_manage_members(membership) -> bool:
    """Owner and admin can invite, remove and change roles."""
    return membership is not None and membership.role in ('owner', 'admin')


def can_assign_role(actor_membership, new_role: str) -> bool:
    """Only owners can assign the owner role; admins can assign up to admin."""
    if new_role == 'owner':
        return actor_membership is not None and actor_membership.role == 'owner'
    return can_manage_members(actor_membership)


def can_delete_org(membership) -> bool:
    return membership is not None and membership.role == 'owner'


def can_view_org(membership) -> bool:
    return membership is not None


def is_last_owner(org) -> bool:
    return OrganizationUser.objects.filter(organization=org, role='owner').count() == 1
