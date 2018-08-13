import json

print('Loading...')

def lambda_handler(event, context):
    # event is a dict object
    print('Got an event: ' + json.dumps(event, indent=2))

    # context is an object - https://docs.aws.amazon.com/lambda/latest/dg/python-context-object.html
    print("Execution context - {} ms remaining".format(context.get_remaining_time_in_millis()))
    print('Execution context: function {} version {}, size {} mb'.format(context.function_name, context.function_version, context.memory_limit_in_mb))
    print('Logging to log group {} and log stream {}'.format(context.log_group_name, context.log_stream_name))

    naam = 'World' if 'name' not in event else event['name']

    groet = 'Hello ' + naam + "!"
    print('We gaan groeten ... ' + groet)

    return groet
    
print('Done loading!')