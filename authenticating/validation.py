from django.shortcuts import redirect
from social.apps.django_app.default.models import UserSocialAuth


def require_email(strategy, details, user=None, is_new=False, *args, **kwargs):
    backend = kwargs.get('backend')
    if user and user.email:
        return
    elif is_new and not details.get('email'):
        userEmail = strategy.request_data().get('email')
        if userEmail:
            details['email'] = userEmail
        else:
            return redirect('acquire_email')


def check_for_achievement(username=None, user=None, is_new=False, storage=None, uid=None, backend=None, social=None,
                          request=None, response=None, strategy=None, pipeline_index=None, new_association=None,
                          details=None):
    if UserSocialAuth.objects.filter(user=user).count() == 3:
        user.set_achievement("social")
