from django.shortcuts import redirect
from social.pipeline.partial import partial
from social.pipeline.user import USER_FIELDS


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
