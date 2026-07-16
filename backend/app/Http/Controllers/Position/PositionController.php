<?php

namespace App\Http\Controllers\Position;

use App\Http\Controllers\Controller;
use App\Http\Requests\Position\StorePositionRequest;
use App\Http\Requests\Position\UpdatePositionRequest;
use App\Http\Resources\Position\PositionResource;
use App\Models\Position;
use App\Services\PositionService;

class PositionController extends Controller
{
    public function __construct(
        protected PositionService $service
    ) {}

    public function index()
    {
        return PositionResource::collection(
            $this->service->all()
        );
    }

    public function store(StorePositionRequest $request)
    {
        $position = $this->service->create(
            $request->validated()
        );

        return new PositionResource($position);
    }

    public function show($id)
    {
        return new PositionResource(
            $this->service->find($id)
        );
    }

    public function update(UpdatePositionRequest $request, Position $position)
    {
        $position = $this->service->update(
            $position,
            $request->validated()
        );

        return new PositionResource($position);
    }

    public function destroy(Position $position)
    {
        $this->service->delete($position);

        return response()->json([
            'message' => 'Position deleted successfully'
        ]);
    }
}