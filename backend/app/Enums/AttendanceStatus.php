<?php

namespace App\Enums;

enum AttendanceStatus: string
{
    case HADIR = 'hadir';

    case LEMBUR = 'lembur';

    case COR = 'cor';

    case ALPHA = 'alpha';
}