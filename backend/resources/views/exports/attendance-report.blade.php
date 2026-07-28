<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="UTF-8">
</head>

<body>

<table>

    {{-- ======================== JUDUL ======================== --}}
    <tr>
        <td colspan="12"
            style="background:#1F4E78;color:#FFFFFF;font-size:18px;font-weight:bold;text-align:center;height:30px;">
            REKAP ABSENSI PEKERJA
        </td>
    </tr>

    <tr>
        <td colspan="12"></td>
    </tr>

    {{-- ======================== INFORMASI ======================== --}}
    <tr>
        <td colspan="2" style="font-weight:bold;background:#EAF3F9;">Proyek</td>
        <td colspan="10" style="background:#EAF3F9;">
            {{ $project->name }}
        </td>
    </tr>

    <tr>
        <td colspan="2" style="font-weight:bold;background:#EAF3F9;">Periode</td>
        <td colspan="10" style="background:#EAF3F9;">
            {{ $week['start']->translatedFormat('d F Y') }}
            -
            {{ $week['end']->translatedFormat('d F Y') }}
        </td>
    </tr>

    <tr>
        <td colspan="12"></td>
    </tr>

    {{-- ======================== HEADER ======================== --}}
    <tr>

        <th style="background:#1F4E78;color:white;border:1px solid #D6D6D6;">No</th>

        <th style="background:#1F4E78; width:90px; color:white;border:1px solid #D6D6D6;">
            Nama Pekerja
        </th>

        <th style="background:#1F4E78;color:white;border:1px solid #D6D6D6;">
            Jabatan
        </th>

        <th style="background:#1F4E78; width:90px; color:white;border:1px solid #D6D6D6;">
            Upah / Hari
        </th>

        <th style="background:#1F4E78;color:white;border:1px solid #D6D6D6;">Sen</th>
        <th style="background:#1F4E78;color:white;border:1px solid #D6D6D6;">Sel</th>
        <th style="background:#1F4E78;color:white;border:1px solid #D6D6D6;">Rab</th>
        <th style="background:#1F4E78;color:white;border:1px solid #D6D6D6;">Kam</th>
        <th style="background:#1F4E78;color:white;border:1px solid #D6D6D6;">Jum</th>
        <th style="background:#1F4E78;color:white;border:1px solid #D6D6D6;">Sab</th>
        <th style="background:#1F4E78;color:white;border:1px solid #D6D6D6;">Min</th>

        <th style="background:#1F4E78; width:90px; color:white;border:1px solid #D6D6D6;">
            Total Upah
        </th>

    </tr>

    @php
        $grandTotal = 0;
    @endphp

    {{-- ======================== DATA ======================== --}}
    @foreach ($workers as $index => $worker)

        @php
            $grandTotal += $worker['total'];
        @endphp

        <tr>

            <td style="border:1px solid #D6D6D6;text-align:center;">
                {{ $index + 1 }}
            </td>

            <td style="border:1px solid #D6D6D6;padding-left:8px;">
                {{ $worker['name'] }}
            </td>

            <td style="border:1px solid #D6D6D6;padding-left:8px;">
                {{ $worker['position'] }}
            </td>

            <td style="border:1px solid #D6D6D6;text-align:right;padding-right:8px;">
                Rp {{ number_format($worker['daily_wage'] ?? 0,0,',','.') }}
            </td>

            @foreach($worker['days'] as $status)

                @php

                    $background='#FFFFFF';
                    $text='';

                    switch($status){

                        case 'hadir':
                        case 'lembur':
                            $text='✓';
                            break;

                        case 'cor':
                            $background='#BDBDBD';
                            break;

                        case 'alpha':
                            $background='#F44336';
                            break;

                    }

                @endphp

                <td
                    style="
                        border:1px solid #D6D6D6;
                        text-align:center;
                        background:{{ $background }};
                        font-weight:bold;
                    ">
                    {{ $text }}
                </td>

            @endforeach

            <td
                style="
                    border:1px solid #D6D6D6;
                    text-align:right;
                    padding-right:8px;
                    font-weight:bold;
                ">
                Rp {{ number_format($worker['total'],0,',','.') }}
            </td>

        </tr>

    @endforeach

    {{-- ======================== TOTAL ======================== --}}
    <tr>

        <td colspan="11"
            style="
                border:1px solid #D6D6D6;
                background:#FFF2CC;
                font-weight:bold;
                text-align:right;
                padding-right:8px;
            ">
            TOTAL PENGELUARAN
        </td>

        <td
            style="
                border:1px solid #D6D6D6;
                background:#FFF2CC;
                font-weight:bold;
                text-align:right;
                padding-right:8px;
            ">
            Rp {{ number_format($grandTotal,0,',','.') }}
        </td>

    </tr>

    <tr>
        <td colspan="12"></td>
    </tr>

    {{-- ======================== KETERANGAN ======================== --}}

    <tr>
        <td colspan="12"
            style="
                background:#D9EAF7;
                font-weight:bold;
                border:1px solid #D6D6D6;
            ">
            KETERANGAN
        </td>
    </tr>

    <tr>

        <td
            style="
                border:1px solid #D6D6D6;
                text-align:center;
                font-weight:bold;
            ">
            ✓
        </td>

        <td colspan="11" style="border:1px solid #D6D6D6;">
            Hadir / Lembur
        </td>

    </tr>

    <tr>

        <td
            style="
                background:#BDBDBD;
                border:1px solid #D6D6D6;
            ">
        </td>

        <td colspan="11" style="border:1px solid #D6D6D6;">
            Cor
        </td>

    </tr>

    <tr>

        <td
            style="
                background:#F44336;
                border:1px solid #D6D6D6;
            ">
        </td>

        <td colspan="11" style="border:1px solid #D6D6D6;">
            Alpha
        </td>

    </tr>

</table>

</body>
</html>