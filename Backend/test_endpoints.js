async function test() {
  const baseUrl = 'http://localhost:3000/api';
  
  const adminId = '50a7cd98-8086-4cce-aced-6f9c60029c46';
  const memberId = '5ba157de-f8d7-4717-8631-1244b59ffbf7';
  const orgId = '8c03645c-30de-4285-a0f2-e2b3e684da26';
  const taskId = '81649d5c-58ed-44c6-bc96-0a4990b5dded';
  
  try {
    console.log('1. GET /tasks/stats/completion-percentage');
    let res = await fetch(`${baseUrl}/tasks/stats/completion-percentage`);
    console.log(await res.json());

    console.log('\n2. GET /tasks/stats/by-priority-status');
    res = await fetch(`${baseUrl}/tasks/stats/by-priority-status`);
    console.log(await res.json());

    console.log('\n3. GET /tasks?status=done');
    res = await fetch(`${baseUrl}/tasks?status=done`);
    console.log((await res.json()).length, 'tareas devueltas');

    console.log('\n4. GET /tasks/grouped/by-project');
    res = await fetch(`${baseUrl}/tasks/grouped/by-project`);
    console.log(await res.json());

    console.log('\n5. GET /tasks/grouped/by-organization');
    res = await fetch(`${baseUrl}/tasks/grouped/by-organization`);
    console.log(await res.json());

    console.log('\n6. GET /tasks/stats/completed-by-user');
    res = await fetch(`${baseUrl}/tasks/stats/completed-by-user`);
    console.log(await res.json());

    console.log('\n7. PUT /organization-users/:org/users/:member (Admin changes member to manager)');
    res = await fetch(`${baseUrl}/organization-users/${orgId}/users/${memberId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ request_user_id: adminId, role: 'manager' })
    });
    console.log('Status code:', res.status);
    console.log(await res.json());

    console.log('\n8. GET /tasks?assignee_id=:admin_id');
    res = await fetch(`${baseUrl}/tasks?assignee_id=${adminId}`);
    console.log((await res.json()).length, 'tareas asignadas al admin');

    console.log('\n9. PATCH /tasks/:task_id/assign');
    res = await fetch(`${baseUrl}/tasks/${taskId}/assign`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assignee_id: memberId })
    });
    const updatedTask = await res.json();
    console.log('New assignee id para la tarea:', updatedTask.assignee_id);
    
  } catch(e) {
    console.error('Error durante el testing:', e);
  }
}

test();
