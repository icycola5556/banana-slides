from conftest import assert_success_response


def test_update_page_variant_syncs_outline_layout_variant(client):
    project_response = client.post('/api/projects', json={
        'creation_type': 'idea',
        'idea_prompt': '测试变体同步',
        'render_mode': 'html',
    })
    project_data = assert_success_response(project_response, 201)
    project_id = project_data['data']['project_id']

    page_response = client.post(f'/api/projects/{project_id}/pages', json={
        'order_index': 0,
        'outline_content': {
            'title': '封面',
            'points': ['副标题'],
            'layout_variant': 'a',
        },
    })
    page_data = assert_success_response(page_response, 201)
    page_id = page_data['data']['page_id']

    update_response = client.put(f'/api/projects/{project_id}/pages/{page_id}', json={
        'html_model': {
            'title': '封面',
            'variant': 'b',
            'layout_variant': 'b',
        },
    })
    updated_page = assert_success_response(update_response)['data']

    assert updated_page['html_model']['layout_variant'] == 'b'
    assert updated_page['outline_content']['layout_variant'] == 'b'

    project_detail_response = client.get(f'/api/projects/{project_id}')
    project_detail = assert_success_response(project_detail_response)['data']
    persisted_page = project_detail['pages'][0]

    assert persisted_page['html_model']['variant'] == 'b'
    assert persisted_page['outline_content']['layout_variant'] == 'b'
