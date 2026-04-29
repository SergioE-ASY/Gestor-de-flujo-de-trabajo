import stripe
from django.conf import settings
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.http import HttpResponse
from django.shortcuts import redirect
from django.views.decorators.csrf import csrf_exempt

stripe.api_key = settings.STRIPE_SECRET_KEY

@login_required
def create_checkout_session(request):

    stripe.api_key = settings.STRIPE_SECRET_KEY

    if request.user.is_premium:
        messages.warning(request, 'Ya eres Premium.')
        return redirect('pricing')
    else:
        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price': settings.STRIPE_PRICE_ID,
                'quantity': 1,
            }],
            mode='subscription',
            customer_email=request.user.email,
            client_reference_id=str(request.user.pk),
            success_url=request.build_absolute_uri('/payments/success/') + '?session_id={CHECKOUT_SESSION_ID}',
            cancel_url=request.build_absolute_uri('/pricing/?cancelled=true'),
        )
        return redirect(session.url)

@login_required
def checkout_success(request):
    session_id = request.GET.get('session_id')
    if session_id:
        try:
            session = stripe.checkout.Session.retrieve(session_id)
            if session.payment_status == 'paid':
                from accounts.models import User
                User.objects.filter(pk=request.user.pk).update(is_premium=True)
                # Also update the in-memory user object so the template reflects it immediately
                request.user.is_premium = True
                messages.success(request, '¡Pago completado! Ya eres Premium.')
            else:
                messages.warning(request, 'El pago aún no se ha confirmado.')
        except Exception as e:
            import traceback
            traceback.print_exc()
            messages.error(request, f'No se pudo verificar el pago: {e}')
    return redirect('pricing')

@csrf_exempt
def stripe_webhook(request):
    payload = request.body
    sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except (ValueError, stripe.error.SignatureVerificationError):
        return HttpResponse(status=400)

    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        email = session.get('customer_email')
        if email:
            from accounts.models import User
            User.objects.filter(email=email).update(is_premium=True)

    elif event['type'] == 'customer.subscription.deleted':
        customer_id = event['data']['object'].get('customer')
        customer = stripe.Customer.retrieve(customer_id)
        email = customer.get('email')
        if email:
            from accounts.models import User
            User.objects.filter(email=email).update(is_premium=False)

    return HttpResponse(status=200)